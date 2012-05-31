from django import forms
from django.core import serializers
from django.core.mail import send_mail
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404, render_to_response
from django.views.decorators.cache import cache_page
from django.views.generic.simple import direct_to_template

from models import Category, Collection, Product

CACHE_LENGTH = 60 * 15
TEMPLATE_INDEX = "wholesale/index.html"
TEMPLATE_CONTACT = "wholesale/contact.html"
TEMPLATE_SHORTLIST = "wholesale/shortlist.html"
TEMPLATE_PRODUCTS = "wholesale/products.html"
TEMPLATE_PRODUCT = "wholesale/product.html"
TEMPLATE_CATEGORIES = "wholesale/categories.html"
TEMPLATE_CATEGORY = "wholesale/category.html"
TEMPLATE_COLLECTIONS = "wholesale/collections.html"
TEMPLATE_COLLECTION = "wholesale/collection.html"


@cache_page(CACHE_LENGTH)
def index(request):
    return direct_to_template(request, TEMPLATE_INDEX, {})


class ContactForm(forms.Form):
    name = forms.CharField(max_length=150)
    email = forms.EmailField(max_length=200)
    message = forms.CharField(widget=forms.widgets.Textarea())


def contact(request):
    success = False
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            body = "Name: " + form.cleaned_data['name'] + "\nEmail: " + form.cleaned_data['email'] + "\n\n" + form.cleaned_data['message']
            send_mail(
                'Hungry Designs Wholesale Enquiry',
                body,
                'notifications@wholesale.hungrydesigns.com',
                ['amanda.whitelaw@me.com']
            )
            form = ContactForm()
            success = True
    else:
        message = request.GET.get("message")
        if message:
            form = ContactForm(initial={'message': message})
        else:
            form = ContactForm()
    context = {
        "title": "Contact Us",
        "form": form,
        "success": success
    }
    return direct_to_template(request, TEMPLATE_CONTACT, context)

@cache_page(CACHE_LENGTH)
def shortlist(request):
    context = {
        "title": "Your Shortlist"
    }
    return direct_to_template(request, TEMPLATE_SHORTLIST, context)

@cache_page(CACHE_LENGTH)
def products(request):
    items = Product.objects.published()
    paginator = Paginator(items, 20)
    page = request.GET.get('page')
    try:
        items = paginator.page(page)
    except PageNotAnInteger:
        items = paginator.page(1)
    except EmptyPage:
        items = paginator.page(paginator.num_pages)
    context = {
        "title": "Products",
        "products": items,
        "paginator": paginator
    }
    return direct_to_template(request, TEMPLATE_PRODUCTS, context)


@cache_page(CACHE_LENGTH)
def product(request, product_slug):
    item = get_object_or_404(Product, slug=product_slug, published=True)
    context = {
        "title": item.name,
        "product": item
    }
    return direct_to_template(request, TEMPLATE_PRODUCT, context)


@cache_page(CACHE_LENGTH)
def categories(request):
    items = Category.objects.all()
    context = {
        "title": "Categories",
        "categories": items
    }
    return direct_to_template(request, TEMPLATE_CATEGORIES, context)


@cache_page(CACHE_LENGTH)
def category(request, category_slug):
    item = get_object_or_404(Category, slug=category_slug)
    products = Product.objects.published().filter(categories__in=[item])
    paginator = Paginator(products, 20)
    page = request.GET.get('page')
    try:
        products = paginator.page(page)
    except PageNotAnInteger:
        products = paginator.page(1)
    except EmptyPage:
        products = paginator.page(paginator.num_pages)
    context = {
        "title": item.name,
        "category": item,
        "products": products,
        "paginator": paginator
    }
    return direct_to_template(request, TEMPLATE_CATEGORY, context)


@cache_page(CACHE_LENGTH)
def collections(request):
    items = Collection.objects.all()
    context = {
        "title": "Collections",
        "collections": items
    }
    return direct_to_template(request, TEMPLATE_COLLECTIONS, context)


@cache_page(CACHE_LENGTH)
def collection(request, collection_slug):
    item = get_object_or_404(Collection, slug=collection_slug)
    products = Product.objects.published().filter(collections__in=[item])
    paginator = Paginator(products, 20)
    page = request.GET.get('page')
    try:
        products = paginator.page(page)
    except PageNotAnInteger:
        products = paginator.page(1)
    except EmptyPage:
        products = paginator.page(paginator.num_pages)
    context = {
        "title": item.name,
        "collection": item,
        "products": products,
        "paginator": paginator
    }
    return direct_to_template(request, TEMPLATE_COLLECTION, context)


@cache_page(CACHE_LENGTH)
def api_products(request):
    return HttpResponse(
        serializers.serialize(
            "json",
            Product.objects.published(),
            fields=("id", "name", "slug", "image", "wholesale_price")
        ),
        mimetype="application/json"
    )