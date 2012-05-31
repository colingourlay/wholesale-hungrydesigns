from django.conf.urls import patterns, include, url

from views import index, contact, shortlist, products, product, categories, category, collections, collection, api_products

urlpatterns = patterns('',
    url(r'^$',                                              index,          name='index'),
    url(r'^contact/$',                                      contact,        name='contact'),
    url(r'^shortlist/$',                                    shortlist,      name='shortlist'),
    url(r'^products/$',                                     products,       name='products'),
    url(r'^products/(?P<product_slug>[\w\-_]+)/$',          product,        name='product'),
    url(r'^categories/$',                                   categories,     name='categories'),
    url(r'^categories/(?P<category_slug>[\w\-_]+)/$',       category,       name='category'),
    url(r'^collections/$',                                  collections,    name='collections'),
    url(r'^collections/(?P<collection_slug>[\w\-_]+)/$',    collection,     name='collection'),
    url(r'^api/products/$',                                 api_products,   name='api_products'),
)
