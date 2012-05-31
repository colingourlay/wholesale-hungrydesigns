/*
 * jQuery Cookie Plugin
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function(a){a.cookie=function(b,c,d){if(arguments.length>1&&(!/Object/.test(Object.prototype.toString.call(c))||c===null||c===undefined)){d=a.extend({},d);if(c===null||c===undefined)d.expires=-1;if(typeof d.expires=="number"){var e=d.expires,f=d.expires=new Date;f.setDate(f.getDate()+e)}return c=String(c),document.cookie=[encodeURIComponent(b),"=",d.raw?c:encodeURIComponent(c),d.expires?"; expires="+d.expires.toUTCString():"",d.path?"; path="+d.path:"",d.domain?"; domain="+d.domain:"",d.secure?"; secure":""].join("")}d=c||{};var g=d.raw?function(a){return a}:decodeURIComponent,h=document.cookie.split("; ");for(var i=0,j;j=h[i]&&h[i].split("=");i++)if(g(j[0])===b)return g(j[1]||"");return null}})(jQuery);

/*
 * Polyfills
 */
(function () {
  if (!Object.keys) {
    Object.keys = function (obj) {
      var keys, k;
      
      keys = [];
      for (k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
          keys.push(k);
        }
      }
      return keys;
    };
  }
})();

/*
 * HD Wholesale
 */
(function ($) {
  "use strict";
  var HDW;
  
  function initNav() {
    $('.nav a').each(function () {
      var $el = $(this);
      
      if (window.location.pathname.indexOf($el.attr("href")) >= 0) {
          $el.parent().addClass("active");
      }
    });
  }
  
  function initShortlist() {
    var productButtonsMarkup, shortlistProductButtonsMarkup, shortlistProductRemoveButtonMarkup;
    
    function updateShortlistCount() {
      $(".shortlist-count").html(Object.keys(HDW.shortlist).length);
    }
    
    function loadShortlist() {
      var cookieText, shortlist;
      
      cookieText = $.cookie("shortlist");
      shortlist = {};
      if (!!cookieText) {
         $.each(cookieText.toString().split(","), function (index, item) {
          var keyVal;
          
          keyVal = item.split(":");
          shortlist[keyVal[0]] = keyVal[1];
        });
      }
      return shortlist;
    }
    
    function saveShortlist(shortlist) {
      var items, key, cookieText;
      
      items = [];
      for (key in shortlist) {
        if (shortlist.hasOwnProperty(key)) {
          items.push([key, shortlist[key]].join(":"));
        }
      }
      cookieText = items.join(",");
      $.cookie("shortlist", cookieText, { path: "/" });
    }
    
    productButtonsMarkup = [
      '<h3>Add to Shortlist</h3>',
      '<p class="btn-group">',
        '<button class="btn btn-danger">0</button>',
        '<button class="btn">1</button>',
        '<button class="btn">2</button>',
        '<button class="btn">5</button>',
        '<button class="btn">10</button>',
      '</p>',
    ].join("");
    
    shortlistProductButtonsMarkup = [
      '<div class="btn-group">',
        '<button class="btn">1</button>',
        '<button class="btn">2</button>',
        '<button class="btn">5</button>',
        '<button class="btn">10</button>',
      '</div>',
    ].join("");
    
    shortlistProductRemoveButtonMarkup = '<button class="btn btn-danger">Remove</button>';
    
    HDW.shortlist = loadShortlist();
    updateShortlistCount();
    
    $('[data-model="product"]').each(function () {
      var $el, id, $buttons;
      
      $el = $(this);
      id = $el.attr("data-id");
      if (id) {
        $buttons = $(productButtonsMarkup);
        $buttons
        .find("button")
          .each(function () {
            var $btn
            
            $btn = $(this);
            if (HDW.shortlist[id] === $btn.html()) {
              $btn
              .addClass("btn-primary")
              .siblings()
                .removeClass("btn-danger");
            }
          })
          .bind("click", function () {
            var $btn;
            
            $btn = $(this);
            if ($btn.html() !== "0") {
              HDW.shortlist[id] = $btn.html();
                $btn
                .addClass("btn-primary")
                .siblings()
                  .removeClass("btn-primary")
                  .removeClass("btn-danger");
            } else {
              delete HDW.shortlist[id];
              $btn
              .addClass("btn-danger")
              .siblings()
                .removeClass("btn-primary");
            }
            saveShortlist(HDW.shortlist);
            updateShortlistCount();
          });
        $el
        .find(".description")
          .after($buttons);
      }
    });
    
    if (window.location.pathname === "/shortlist/") {
      $.getJSON("/api/products/", function (data) {
        var $table, $tableBody, $totalRow, $contactButton;
        
        function updateTotal() {
          var $total, $items, runningTotal;
          
          $total = $("#total");
          $items = $(".sum");
          runningTotal = 0;
          $items.each(function (index, item) {
            runningTotal += (1 * $(this).html());
          });
          $total.html(runningTotal.toFixed(2));
        }
        
        $table = $(".table-shortlist");
        $tableBody = $table.find("tbody");
        $totalRow = $tableBody.find("tr");
        HDW.products = data;
        $.each(HDW.products, function (index, item) {
          var $row, $productName, $productCost, $productNum, $sum, $productNumButtons, $productRemoveButton;
          
          if (HDW.shortlist[item.pk] != null) {
            $row = $("<tr/>");
            $productName = $([
              '<td>',
                '<a class="product-name" href="/products/', item.fields.slug, '">',
                  item.fields.name,
                '</a>',
              '</td>'
            ].join(""));
            $productCost = $([
              '<td class="product-price currency">',
                (1 * item.fields.wholesale_price).toFixed(2),
              '</td>'
            ].join(""));
            $productNum = $('<td class="product-num"></td>');
            $sum = $([
              '<td class="product-total sum currency">',
                (1 * HDW.shortlist[item.pk] * item.fields.wholesale_price).toFixed(2),
              '</td>'
            ].join(""));
            $productNumButtons = $(shortlistProductButtonsMarkup);
            $productNumButtons
            .find("button")
              .each(function () {
                var $btn
                
                $btn = $(this);
                if (HDW.shortlist[item.pk] === $btn.html()) {
                  $btn
                  .addClass("btn-primary");
                }
              })
              .bind("click", function () {
                var $btn;
                
                $btn = $(this);
                HDW.shortlist[item.pk] = $btn.html();
                $btn
                .addClass("btn-primary")
                .siblings()
                  .removeClass("btn-primary");
                saveShortlist(HDW.shortlist);
                $sum.html((1 * HDW.shortlist[item.pk] * item.fields.wholesale_price).toFixed(2));
                updateTotal();
                updateShortlistCount();
              });
            $productRemoveButton = $(shortlistProductRemoveButtonMarkup);
            $productRemoveButton
            .bind("click", function () {
                delete HDW.shortlist[item.pk];
                $row.remove();
                saveShortlist(HDW.shortlist);
                updateTotal();
                updateShortlistCount();
              });
            $productNumButtons.prepend($productRemoveButton);
            $productNum.append($productNumButtons);
            $row.append($productName, $productCost, $productNum, $sum);
            $tableBody.append($row);
          }
        });
        $tableBody.append($totalRow);
        updateTotal();
        updateShortlistCount();
        if ($tableBody.find("tr").length === 1) {
          $table.before('<div class="alert alert-block alert-error">Your shortlist is currently empty.</div>');
        } else {
          $contactButton = $('<button class="btn btn-large btn-primary" data-loading-text="Creating Message From Shortlist...">Send Us Your Shortlist</button>');
          $contactButton
          .bind("click", function () {
            var $button, message;

            $button = $(this);
            $button
            .button('loading');
            message = "\n============\nMy Shortlist\n============\n\n";
            $.each(HDW.products, function (index, item) {
              if (HDW.shortlist[item.pk] != null) {
                message += [HDW.shortlist[item.pk], " x ", item.fields.name, "\n"].join("");
              }
            });
            message += ["\nEstimated Total = $", $("#total").html(), "\n"].join("");
            window.location = "/contact/?message=" + encodeURIComponent(message);
          });
          $table.after($contactButton, $("<hr/>"));
        }
      });
    }
  }
  
  function initContact() {
    if (window.location.pathname === "/contact/") {
      $("form")
      .bind("submit", function () {
        $(".btn-send").button("loading");
      });
    }
  }
  
  function init() {
    initNav();
    initShortlist();
    initContact();
  };
  
  HDW = window.HDW = {};
  $(init);

})(jQuery);