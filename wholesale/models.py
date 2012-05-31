from django.contrib import admin
from django.db import models
from django.template.defaultfilters import slugify


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.CharField(max_length=150, editable=False)
    
    def __unicode__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Category, self).save(*args, **kwargs)
    
    @models.permalink
    def get_absolute_url(self):
        return ('category', [self.slug])
    
    class Meta:
        verbose_name_plural = "categories"
        ordering = ['name']

admin.site.register(Category)


class Collection(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.CharField(max_length=150, editable=False)
    
    def __unicode__(self):
        return self.name
        
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Collection, self).save(*args, **kwargs)
    
    @models.permalink
    def get_absolute_url(self):
        return ('collection', [self.slug])
    
    class Meta:
        ordering = ['name']

admin.site.register(Collection)


class ProductManager(models.Manager):
    def published(self):
        return self.filter(published=True)


class Product(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.CharField(max_length=150, editable=False)
    image = models.FileField(upload_to="product_images")
    description = models.TextField()
    wholesale_price = models.DecimalField(max_digits=6, decimal_places=2)
    retail_price = models.DecimalField(max_digits=6, decimal_places=2, blank=True)
    published = models.BooleanField()
    categories = models.ManyToManyField(Category)
    collections = models.ManyToManyField(Collection)
    
    objects = ProductManager()
    
    def __unicode__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Product, self).save(*args, **kwargs)
    
    @models.permalink
    def get_absolute_url(self):
        return ('product', [self.slug])
    
    class Meta:
        ordering = ['name']


class ProductAdmin(admin.ModelAdmin):
    actions_on_top = False
    actions_on_bottom = True
    list_display = ('name', 'published', 'wholesale_price', 'retail_price',)
    list_filter = ('categories', 'collections', 'published',)
    fieldsets = (
        (None, {
            'fields': ('name', 'image', 'description', 'published')
        }),
        ('Pricing', {
            'fields': ('wholesale_price', 'retail_price')
        }),
        ('Taxonomy', {
            'fields': ('categories', 'collections')
        }),
    )
    filter_horizontal = ('categories', 'collections',)
    
admin.site.register(Product, ProductAdmin)


class Snippet(models.Model):
    slug = models.SlugField(max_length=100, unique=True)
    template = models.TextField()
    
    def __unicode__(self):
        return self.slug

admin.site.register(Snippet)