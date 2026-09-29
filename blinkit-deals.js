/**
 * Blinkit Deal Hunter v3
 * Paste into the DevTools console on https://blinkit.com (delivery location already set).
 *
 * - Search by Keyword: scans all pages of a search query with a 500ms courtesy pause.
 * - Search by Category: crawls all pages of a chosen subcategory.
 * - Tab opens only AFTER products are fetched and sorted.
 * - Responsive 2-column mobile view with enlarged product images.
 */
(function () {
  "use strict";

  const ROOT_ID = "bk-deal-hunter";
  ["blinkit-sort-tester-container", ROOT_ID, "dh-overlay"].forEach((id) => document.getElementById(id)?.remove());

  // ---------- Context (100% Dynamic Location from Blinkit) ----------
  const cookie = (n) => {
    const m = document.cookie.match(new RegExp("(?:^|; )" + n + "=([^;]*)"));
    if (!m) return "";
    try { return decodeURIComponent(m[1]); } catch { return m[1]; }
  };

  const getDynamicContext = () => {
    const pre = (window.grofers && window.grofers.PRELOADED_STATE && window.grofers.PRELOADED_STATE.data) || {};
    const loc = pre.location || {};
    const preCoords = loc.coords || {};

    let storageCoords = {}, storageLocality = "";
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && /location|address|coords|user_loc/i.test(k)) {
          try {
            const val = JSON.parse(localStorage.getItem(k));
            if (val && typeof val === "object") {
              if (val.lat && val.lon) storageCoords = val;
              else if (val.coords && val.coords.lat) storageCoords = val.coords;
              if (val.locality || val.cityName) storageLocality = val.locality || val.cityName;
            }
          } catch (_) {}
        }
      }
    } catch (_) {}

    const lat = preCoords.lat || cookie("gr_1_lat") || storageCoords.lat || "";
    const lon = preCoords.lon || cookie("gr_1_lon") || storageCoords.lon || "";
    const locality = loc.locality || loc.cityName || cookie("gr_1_locality") || cookie("gr_1_city") || storageLocality || "";

    return {
      lat: String(lat || ""),
      lon: String(lon || ""),
      locality: locality || (lat && lon ? "Selected Location" : "Location not set"),
      chainId: pre.chainId || cookie("gr_1_chain_id") || "",
      detected: !!(lat && lon),
    };
  };

  let CTX = getDynamicContext();

  const TAXONOMY = [
  {
    "name": "Baby Care",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzMzk=",
    "groupings": [
      {
        "id": 46757,
        "name": "Diaper & Wipes"
      },
      {
        "id": 20667,
        "name": "Baby Food"
      },
      {
        "id": 11683,
        "name": "Baby Shampoo & Soaps"
      },
      {
        "id": 11682,
        "name": "Skin & Hair Care"
      },
      {
        "id": 11686,
        "name": "Feeding Essentials"
      },
      {
        "id": 46758,
        "name": "Clothes & Accessories"
      },
      {
        "id": 11687,
        "name": "Health &  Hygiene"
      },
      {
        "id": 11688,
        "name": "Baby Oral Care"
      },
      {
        "id": 11689,
        "name": "Baby Toys & Gifts"
      },
      {
        "id": 628097,
        "name": "Baby Gear"
      },
      {
        "id": 814811,
        "name": "Mom Care Needs"
      }
    ]
  },
  {
    "name": "Bath & Body",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDY=",
    "groupings": [
      {
        "id": 679509,
        "name": "Bathing Soaps"
      },
      {
        "id": 723321,
        "name": "Shower Gels & Scrubs"
      },
      {
        "id": 11650,
        "name": "Oral Care"
      },
      {
        "id": 11658,
        "name": "Handwash"
      },
      {
        "id": 174026,
        "name": "Fragrance & Talc"
      },
      {
        "id": 12739,
        "name": "Bath Accessories"
      },
      {
        "id": 12011,
        "name": "Shampoo"
      },
      {
        "id": 12012,
        "name": "Conditioner"
      },
      {
        "id": 209068,
        "name": "Face Cleaning"
      },
      {
        "id": 209073,
        "name": "Body Lotions & Oils"
      },
      {
        "id": 887335,
        "name": "Body Treatment & Roll On"
      },
      {
        "id": 18689,
        "name": "Bath & Beauty Gifts"
      }
    ]
  },
  {
    "name": "Beauty & Cosmetics",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDE=",
    "groupings": [
      {
        "id": 11672,
        "name": "Lipstick & Gloss "
      },
      {
        "id": 11671,
        "name": "Cleansers & Toners"
      },
      {
        "id": 11675,
        "name": "Foundation & Compact"
      },
      {
        "id": 22980,
        "name": "Blush & Highlighter"
      },
      {
        "id": 11676,
        "name": "Primer & Concealer"
      },
      {
        "id": 11673,
        "name": "Kajal & Eyeliners"
      },
      {
        "id": 11911,
        "name": "Bindi, Bangles & Others"
      },
      {
        "id": 11674,
        "name": "Nail Paints & Accessories"
      },
      {
        "id": 13642,
        "name": "Beauty Accessories"
      },
      {
        "id": 628082,
        "name": "Bath & Beauty Gifts"
      },
      {
        "id": 128500,
        "name": "Beauty E-Card"
      }
    ]
  },
  {
    "name": "Feminine Hygiene",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDA=",
    "groupings": [
      {
        "id": 12237,
        "name": "Sanitary Pads"
      },
      {
        "id": 11677,
        "name": "Tampons & Menstrual Cups"
      },
      {
        "id": 12238,
        "name": "Period Panty"
      },
      {
        "id": 11680,
        "name": "Period Pain Relief"
      },
      {
        "id": 11678,
        "name": "Intimate Wash & Wipes"
      },
      {
        "id": 12239,
        "name": "Hair Removal"
      },
      {
        "id": 11679,
        "name": "Mom Care"
      }
    ]
  },
  {
    "name": "Hair",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDU=",
    "groupings": [
      {
        "id": 12014,
        "name": "Shampoo"
      },
      {
        "id": 12015,
        "name": "Conditioner"
      },
      {
        "id": 135472,
        "name": "Hair Colour"
      },
      {
        "id": 12016,
        "name": "Hair Colour"
      },
      {
        "id": 11659,
        "name": "Hair Oil & Cream"
      },
      {
        "id": 135473,
        "name": "Hair Serums"
      },
      {
        "id": 11660,
        "name": "Hair Serum"
      },
      {
        "id": 11661,
        "name": "Hair Styling"
      },
      {
        "id": 12018,
        "name": "Appliances"
      },
      {
        "id": 11662,
        "name": "Hair Accessories"
      }
    ]
  },
  {
    "name": "Health & Pharma",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzMzI=",
    "groupings": [
      {
        "id": 532514,
        "name": "Fever & Pain Relief"
      },
      {
        "id": 556584,
        "name": "Cough, Cold & Flu"
      },
      {
        "id": 11698,
        "name": "Masks & Sanitizers"
      },
      {
        "id": 531928,
        "name": "Stomach & Digestive Care"
      },
      {
        "id": 11695,
        "name": "Protein Supplements"
      },
      {
        "id": 11694,
        "name": "Vitamins & Supplements"
      },
      {
        "id": 534592,
        "name": "Derma Medicines"
      },
      {
        "id": 534549,
        "name": "Bandaid & Wound Care"
      },
      {
        "id": 534595,
        "name": "Eye & Ear Care"
      },
      {
        "id": 11697,
        "name": "Adult Diapers"
      },
      {
        "id": 766707,
        "name": "Health & Ortho Supports"
      },
      {
        "id": 534594,
        "name": "Gynaecology Medicines"
      },
      {
        "id": 556595,
        "name": "Oral Care"
      },
      {
        "id": 534591,
        "name": "Diabetes Medicines"
      },
      {
        "id": 534587,
        "name": "Heart Medicines"
      },
      {
        "id": 534593,
        "name": "Neuro Medicines"
      },
      {
        "id": 627432,
        "name": "Hangover Cure"
      },
      {
        "id": 128505,
        "name": "Health & Wellness E-Cards"
      }
    ]
  },
  {
    "name": "Sexual Wellness",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzMzA=",
    "groupings": [
      {
        "id": 12241,
        "name": "Massagers"
      },
      {
        "id": 12240,
        "name": "Condoms"
      },
      {
        "id": 11699,
        "name": "Lubricants"
      },
      {
        "id": 11748,
        "name": "Enhancers"
      },
      {
        "id": 63166,
        "name": "Adult Games"
      },
      {
        "id": 486692,
        "name": "Test Kits"
      },
      {
        "id": 557599,
        "name": "Medicines"
      }
    ]
  },
  {
    "name": "Skin & Face",
    "superCategory": "Beauty & Personal Care",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDI=",
    "groupings": [
      {
        "id": 12020,
        "name": "Sunscreen"
      },
      {
        "id": 204868,
        "name": "Face Cleaning"
      },
      {
        "id": 206263,
        "name": "Face Oil, Serum & Essence"
      },
      {
        "id": 204873,
        "name": "Face Moisturisers"
      },
      {
        "id": 204875,
        "name": "Body Lotions & Oils"
      },
      {
        "id": 204900,
        "name": "Lip & Eye Care"
      },
      {
        "id": 887330,
        "name": "Face Masks & Packs"
      },
      {
        "id": 887331,
        "name": "Toners & Mists"
      },
      {
        "id": 887332,
        "name": "Acne & Blackhead Fixers"
      },
      {
        "id": 204902,
        "name": "Men's Grooming"
      },
      {
        "id": 204891,
        "name": "Women's Grooming"
      }
    ]
  },
  {
    "name": "Atta, Rice & Dal",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNjk=",
    "groupings": [
      {
        "id": 16426,
        "name": "Atta"
      },
      {
        "id": 16431,
        "name": "Local Rice"
      },
      {
        "id": 41521,
        "name": "Rice"
      },
      {
        "id": 16423,
        "name": "Dal"
      },
      {
        "id": 16430,
        "name": "Besan, Sooji & Maida"
      },
      {
        "id": 16425,
        "name": "Rajma, Chhole & Others"
      },
      {
        "id": 874060,
        "name": "Millet & Other Flours"
      },
      {
        "id": 16427,
        "name": "Organic"
      },
      {
        "id": 31475,
        "name": "Poha, Daliya & Other Grains"
      },
      {
        "id": 885921,
        "name": "Summer Specials"
      }
    ]
  },
  {
    "name": "Bakery & Biscuits",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNTQ=",
    "groupings": [
      {
        "id": 11527,
        "name": "Cookies"
      },
      {
        "id": 11528,
        "name": "Cream Biscuits"
      },
      {
        "id": 11530,
        "name": "Healthy & Digestive"
      },
      {
        "id": 11531,
        "name": "Sweet & Salty"
      },
      {
        "id": 12726,
        "name": "Glucose & Marie"
      },
      {
        "id": 12732,
        "name": "Rusks & Wafers"
      },
      {
        "id": 11529,
        "name": "Cakes & Rolls"
      },
      {
        "id": 11532,
        "name": "Baking Ingredients"
      },
      {
        "id": 11534,
        "name": "Gourmet Bakery"
      },
      {
        "id": 18679,
        "name": "Biscuit Gift Pack"
      }
    ]
  },
  {
    "name": "Chicken, Meat & Fish",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNTI=",
    "groupings": [
      {
        "id": 11537,
        "name": "Chicken"
      },
      {
        "id": 24161,
        "name": "Fresh Meat"
      },
      {
        "id": 11540,
        "name": "Fish & Seafood"
      },
      {
        "id": 11543,
        "name": "Mutton"
      },
      {
        "id": 497533,
        "name": "Frozen Non-Veg Snacks"
      },
      {
        "id": 880650,
        "name": "Non Veg Spices"
      },
      {
        "id": 11538,
        "name": "Sausage, Salami & Ham"
      },
      {
        "id": 11541,
        "name": "Exotic Meat"
      },
      {
        "id": 900714,
        "name": "Fresh Marinades"
      },
      {
        "id": 11542,
        "name": "Plant Based Meat"
      },
      {
        "id": 11539,
        "name": "Eggs"
      }
    ]
  },
  {
    "name": "Dairy, Bread & Eggs",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNTU=",
    "groupings": [
      {
        "id": 11591,
        "name": "Milk"
      },
      {
        "id": 11592,
        "name": "Bread & Pav"
      },
      {
        "id": 11595,
        "name": "Eggs"
      },
      {
        "id": 11593,
        "name": "Curd & Yogurt"
      },
      {
        "id": 17124,
        "name": "Cheese & Butter"
      },
      {
        "id": 109735,
        "name": "Batter"
      },
      {
        "id": 11596,
        "name": "Paneer & Tofu"
      },
      {
        "id": 183969,
        "name": "Soy Milk & More"
      },
      {
        "id": 11594,
        "name": "Lassi & Milkshakes"
      },
      {
        "id": 11598,
        "name": "Cream & Whitener"
      }
    ]
  },
  {
    "name": "Dry Fruits & Cereals",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNTM=",
    "groupings": [
      {
        "id": 11599,
        "name": "Dry Fruits"
      },
      {
        "id": 11600,
        "name": "Dry Fruits Snacks"
      },
      {
        "id": 11601,
        "name": "Corn Flakes & Kids Cereals"
      },
      {
        "id": 11602,
        "name": "Muesli & Granola"
      },
      {
        "id": 11603,
        "name": "Oats & Daliya"
      },
      {
        "id": 892781,
        "name": "Dates"
      },
      {
        "id": 892782,
        "name": "Seeds"
      },
      {
        "id": 11606,
        "name": "Vermicelli & Poha"
      },
      {
        "id": 11605,
        "name": "Organic & Premium"
      },
      {
        "id": 12734,
        "name": "Dry Fruit Gift Packs"
      }
    ]
  },
  {
    "name": "Kitchenware & Appliances",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTI5ODI=",
    "groupings": [
      {
        "id": 620088,
        "name": "Bottles & Flasks"
      },
      {
        "id": 659661,
        "name": "Kitchen Accessories"
      },
      {
        "id": 620090,
        "name": "Mugs & Glasses"
      },
      {
        "id": 620091,
        "name": "Cookware & Sets"
      },
      {
        "id": 620092,
        "name": "Storage & Containers"
      },
      {
        "id": 620093,
        "name": "Barware"
      },
      {
        "id": 620094,
        "name": "Lunch Boxes"
      },
      {
        "id": 620095,
        "name": "Cutting & Chopping"
      },
      {
        "id": 578042,
        "name": "Dining & Serveware"
      },
      {
        "id": 13653,
        "name": "Kitchen Appliances"
      },
      {
        "id": 13652,
        "name": "Tissues & Disposables"
      }
    ]
  },
  {
    "name": "Oil, Ghee & Masala",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNTY=",
    "groupings": [
      {
        "id": 18687,
        "name": "Oil"
      },
      {
        "id": 11585,
        "name": "Desi Ghee"
      },
      {
        "id": 92942,
        "name": "Cow Ghee"
      },
      {
        "id": 16433,
        "name": "Powdered Spices"
      },
      {
        "id": 880385,
        "name": "Non Veg Spices"
      },
      {
        "id": 11582,
        "name": "Salt, Sugar & Jaggery"
      },
      {
        "id": 17743,
        "name": "Whole Spices"
      },
      {
        "id": 895753,
        "name": "Gravy Mixes & Pastes"
      },
      {
        "id": 16419,
        "name": "Herbs & Seasoning"
      },
      {
        "id": 11590,
        "name": "Organic"
      }
    ]
  },
  {
    "name": "Vegetables & Fruits",
    "superCategory": "Grocery & Kitchen",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNzE=",
    "groupings": [
      {
        "id": 90651,
        "name": "All"
      },
      {
        "id": 11370,
        "name": "Fresh Vegetables"
      },
      {
        "id": 11371,
        "name": "Fresh Fruits"
      },
      {
        "id": 11372,
        "name": "Exotics"
      },
      {
        "id": 11373,
        "name": "Coriander & Others"
      },
      {
        "id": 11374,
        "name": "Freshly Cut & Sprouts"
      },
      {
        "id": 11375,
        "name": "Trusted Organics"
      },
      {
        "id": 18664,
        "name": "Flowers & Leaves"
      },
      {
        "id": 16398,
        "name": "Seasonal"
      },
      {
        "id": 11376,
        "name": "Frozen Veg"
      },
      {
        "id": 11377,
        "name": "Hydroponic"
      }
    ]
  },
  {
    "name": "Cleaners & Repellents",
    "superCategory": "Household Essentials",
    "uuid": "OTg3NjU0MzIxMjM0NTMzMjc=",
    "groupings": [
      {
        "id": 11720,
        "name": "Repellents & Disinfectants"
      },
      {
        "id": 11711,
        "name": "Detergent Powder & Bars"
      },
      {
        "id": 82715,
        "name": "Liquid Detergents"
      },
      {
        "id": 11715,
        "name": "Laundry Additives"
      },
      {
        "id": 12759,
        "name": "Dishwashing Gels & Bars"
      },
      {
        "id": 12760,
        "name": "Dishwashing Accessories"
      },
      {
        "id": 11713,
        "name": "Toilet Cleaners"
      },
      {
        "id": 11714,
        "name": "Floor Cleaners"
      },
      {
        "id": 11716,
        "name": "Cleaning Tools"
      },
      {
        "id": 11718,
        "name": "Garbage Bags"
      },
      {
        "id": 11721,
        "name": "Glass, Metal Cleaners & Others"
      },
      {
        "id": 36577,
        "name": "Shoe Care"
      },
      {
        "id": 11722,
        "name": "Machine & Car Care"
      },
      {
        "id": 628094,
        "name": "Household Appliance Cleaners"
      }
    ]
  },
  {
    "name": "Electronics",
    "superCategory": "Household Essentials",
    "uuid": "OTg3NjU0MzIxMjM0NTMzMjY=",
    "groupings": [
      {
        "id": 11728,
        "name": "Trimmers & Hair Appliances"
      },
      {
        "id": 17702,
        "name": "Earphones & Headsets"
      },
      {
        "id": 12249,
        "name": "Speakers"
      },
      {
        "id": 11723,
        "name": "Mobile & Computer"
      },
      {
        "id": 11724,
        "name": "Decorative Lights"
      },
      {
        "id": 98396,
        "name": "Chargers & Cables"
      },
      {
        "id": 12250,
        "name": "Smart Watches"
      },
      {
        "id": 628148,
        "name": "Kitchen Appliances"
      },
      {
        "id": 349680,
        "name": "Laptop & Mobile Phones"
      },
      {
        "id": 12248,
        "name": "Batteries"
      },
      {
        "id": 11726,
        "name": "Extension Cables & Accessories"
      },
      {
        "id": 11727,
        "name": "Home Appliances"
      },
      {
        "id": 118329,
        "name": "Music Instruments & Accessories"
      },
      {
        "id": 128506,
        "name": "Electronics E-Card"
      }
    ]
  },
  {
    "name": "Home & Lifestyle",
    "superCategory": "Household Essentials",
    "uuid": "OTg3NjU0MzIxMjM0NTMzMjk=",
    "groupings": [
      {
        "id": 274585,
        "name": "Home Decor"
      },
      {
        "id": 11740,
        "name": "Plants & Bouquets"
      },
      {
        "id": 11705,
        "name": "Bedsheets & Towels"
      },
      {
        "id": 416530,
        "name": "Gardening"
      },
      {
        "id": 11710,
        "name": "Decorative Lights"
      },
      {
        "id": 11702,
        "name": "Home Needs"
      },
      {
        "id": 628253,
        "name": "Tissues & Disposables"
      },
      {
        "id": 131574,
        "name": "Jewellery"
      },
      {
        "id": 11703,
        "name": "Innerwear"
      },
      {
        "id": 11707,
        "name": "Lifestyle Accessories"
      },
      {
        "id": 659636,
        "name": "Party & Festive Needs"
      },
      {
        "id": 627704,
        "name": "Socks & Handkerchiefs"
      },
      {
        "id": 11709,
        "name": "Fresheners"
      },
      {
        "id": 21983,
        "name": "Pooja Needs"
      },
      {
        "id": 22864,
        "name": "Bathroom Essentials"
      },
      {
        "id": 22865,
        "name": "Bags"
      },
      {
        "id": 127889,
        "name": "E-Gift Cards"
      }
    ]
  },
  {
    "name": "Stationery & Games",
    "superCategory": "Household Essentials",
    "uuid": "OTg3NjU0MzIxMjM0NTMzMjU=",
    "groupings": [
      {
        "id": 627397,
        "name": "Notebooks & Diaries"
      },
      {
        "id": 627401,
        "name": "Pens & Pencils"
      },
      {
        "id": 12256,
        "name": "Toys & Games"
      },
      {
        "id": 11730,
        "name": "Glue & Tape"
      },
      {
        "id": 12254,
        "name": "Books & Magazines"
      },
      {
        "id": 12255,
        "name": "Bags & School Needs"
      },
      {
        "id": 714981,
        "name": "Children's Books"
      },
      {
        "id": 583269,
        "name": "Arts & Crafts"
      },
      {
        "id": 12257,
        "name": "Files & Office Needs"
      },
      {
        "id": 627415,
        "name": "Gift Wraps & Bags"
      },
      {
        "id": 11731,
        "name": "Sports & Gym"
      },
      {
        "id": 11729,
        "name": "Shoe Polish & Brush"
      }
    ]
  },
  {
    "name": "Chips & Namkeen",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNjg=",
    "groupings": [
      {
        "id": 11402,
        "name": "Chips & Wafers"
      },
      {
        "id": 11405,
        "name": "Bhujia & Mixtures"
      },
      {
        "id": 11404,
        "name": "Namkeen Snacks"
      },
      {
        "id": 11407,
        "name": "Nachos"
      },
      {
        "id": 11403,
        "name": "Healthy Snacks"
      },
      {
        "id": 11406,
        "name": "Popcorn"
      },
      {
        "id": 11408,
        "name": "Papad & Fryums"
      },
      {
        "id": 11410,
        "name": "Premium"
      },
      {
        "id": 11409,
        "name": "Gift Packs"
      }
    ]
  },
  {
    "name": "Drinks & Juices",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNTE=",
    "groupings": [
      {
        "id": 11607,
        "name": "Soft Drinks"
      },
      {
        "id": 673755,
        "name": "Fruit Juices"
      },
      {
        "id": 885907,
        "name": "Zero Sugar Drinks"
      },
      {
        "id": 14471,
        "name": "Energy Drinks"
      },
      {
        "id": 304488,
        "name": "Hydration Drinks"
      },
      {
        "id": 11613,
        "name": "Soda & Mixers"
      },
      {
        "id": 11615,
        "name": "Water & Ice Cubes"
      },
      {
        "id": 18673,
        "name": "Mango Drinks"
      },
      {
        "id": 17133,
        "name": "Soy Milk & More"
      },
      {
        "id": 18675,
        "name": "Cold Coffee & Ice Tea"
      },
      {
        "id": 11616,
        "name": "Coconut Water"
      },
      {
        "id": 11609,
        "name": "Concentrates & Syrups"
      },
      {
        "id": 11750,
        "name": "Premium"
      },
      {
        "id": 18695,
        "name": "Beverages Gift Packs"
      }
    ]
  },
  {
    "name": "Ice Creams & More",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMxOTg=",
    "groupings": [
      {
        "id": 12770,
        "name": "Tubs"
      },
      {
        "id": 12768,
        "name": "Sticks"
      },
      {
        "id": 15719,
        "name": "Cones"
      },
      {
        "id": 12769,
        "name": "Cassata & Sandwich"
      },
      {
        "id": 12778,
        "name": "Single Serve Cups"
      },
      {
        "id": 806290,
        "name": "Cakes & Others"
      },
      {
        "id": 12779,
        "name": "Guilt-Free"
      },
      {
        "id": 12777,
        "name": "Gourmet"
      },
      {
        "id": 354853,
        "name": "Syrups"
      }
    ]
  },
  {
    "name": "Instant Food",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDk=",
    "groupings": [
      {
        "id": 11624,
        "name": "Noodles"
      },
      {
        "id": 11629,
        "name": "Frozen Veg Snacks"
      },
      {
        "id": 11626,
        "name": "Pasta"
      },
      {
        "id": 11625,
        "name": "Frozen Non-Veg Snacks"
      },
      {
        "id": 11628,
        "name": "Soup"
      },
      {
        "id": 11627,
        "name": "Ready to Eat"
      },
      {
        "id": 11630,
        "name": "Idli & Dosa Batter"
      },
      {
        "id": 11631,
        "name": "Dessert & Cake Mixes"
      },
      {
        "id": 11632,
        "name": "Organic & Premium"
      },
      {
        "id": 18693,
        "name": "Energy Bars"
      }
    ]
  },
  {
    "name": "Paan Corner",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDc=",
    "groupings": [
      {
        "id": 15119,
        "name": "Cigarettes"
      },
      {
        "id": 383144,
        "name": "Lighters"
      },
      {
        "id": 62439,
        "name": "Cigar"
      },
      {
        "id": 11644,
        "name": "Rolling Needs"
      },
      {
        "id": 744872,
        "name": "Hookah Needs"
      },
      {
        "id": 127956,
        "name": "Rolling Tobacco"
      },
      {
        "id": 127957,
        "name": "Paan Masala"
      },
      {
        "id": 438175,
        "name": "Ashtrays"
      },
      {
        "id": 11649,
        "name": "Mouth Fresheners & Gums"
      },
      {
        "id": 389984,
        "name": "Non-Tobacco Blends"
      },
      {
        "id": 15725,
        "name": "Smoking Cessation"
      }
    ]
  },
  {
    "name": "Sauces & Spreads",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNDg=",
    "groupings": [
      {
        "id": 11643,
        "name": "Tomato Ketchup"
      },
      {
        "id": 11636,
        "name": "Jam & Spreads"
      },
      {
        "id": 11641,
        "name": "Mayonnaise"
      },
      {
        "id": 11638,
        "name": "Chutney & Pickle "
      },
      {
        "id": 11639,
        "name": "Peanut Butter"
      },
      {
        "id": 11634,
        "name": "Asian Sauces"
      },
      {
        "id": 11640,
        "name": "Chyawanprash & Honey"
      },
      {
        "id": 105531,
        "name": "Syrups"
      },
      {
        "id": 326530,
        "name": "Dips & Salad Dressings"
      },
      {
        "id": 11633,
        "name": "Cooking Sauces"
      },
      {
        "id": 11635,
        "name": "Premium"
      }
    ]
  },
  {
    "name": "Sweets & Chocolates",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNjc=",
    "groupings": [
      {
        "id": 11414,
        "name": "Chocolates"
      },
      {
        "id": 11415,
        "name": "Chocolate Packs"
      },
      {
        "id": 18681,
        "name": "Chocolate Gift Pack"
      },
      {
        "id": 11418,
        "name": "Indian Sweets"
      },
      {
        "id": 11417,
        "name": "Candies & Gum"
      },
      {
        "id": 13640,
        "name": "Premium"
      },
      {
        "id": 18685,
        "name": "Energy Bars"
      },
      {
        "id": 11419,
        "name": "Syrups"
      }
    ]
  },
  {
    "name": "Tea, Coffee & Milk Drinks",
    "superCategory": "Snacks & Drinks",
    "uuid": "OTg3NjU0MzIxMjM0NTMzNTA=",
    "groupings": [
      {
        "id": 11617,
        "name": "Tea"
      },
      {
        "id": 11618,
        "name": "Coffee"
      },
      {
        "id": 18677,
        "name": "Hot Chocolate"
      },
      {
        "id": 11619,
        "name": "Green Tea"
      },
      {
        "id": 11622,
        "name": "Milk Drinks"
      },
      {
        "id": 11620,
        "name": "Cold Coffee & Ice Tea"
      },
      {
        "id": 11621,
        "name": "Bags & Premixes"
      },
      {
        "id": 11623,
        "name": "Premium"
      },
      {
        "id": 899305,
        "name": "Herbal Infusion"
      }
    ]
  }
];;

  // ---------- Helpers ----------
  const LIMIT = 15, CONCURRENCY = 3, MAX_PAGES = 200; // safety ceiling
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const tx = (v) => (v && typeof v === "object" ? v.text || "" : v == null ? "" : String(v));
  const toNum = (s) => { const n = parseFloat(String(s).replace(/[^0-9.]/g, "")); return Number.isFinite(n) ? n : 0; };
  const round2 = (n) => Math.round(n * 100) / 100;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Session search cache to prevent duplicate calls
  const searchCache = new Map();

  // ---------- Parsing ----------
  function toItem(d) {
    const ci = (d.atc_action && d.atc_action.add_to_cart && d.atc_action.add_to_cart.cart_item) || null;
    const name = tx(d.name) || (ci && (ci.display_name || ci.product_name)) || "";
    const price = toNum(tx(d.normal_price)) || Number(ci && ci.price) || 0;
    let mrp = toNum(tx(d.mrp)) || Number(ci && ci.mrp) || 0;
    if (!name || !price) return null;
    if (!mrp || mrp < price) mrp = price;

    const ratingNum = parseFloat(d.rating && d.rating.value);
    let badge = "";
    if (Array.isArray(d.product_badges) && d.product_badges.length) badge = tx(d.product_badges[0]);
    else if (d.product_badge_type) badge = String(d.product_badge_type);
    const img = (d.image && (d.image.url || d.image)) || (ci && ci.image_url) || "";

    return {
      productId: String(d.product_id != null ? d.product_id : (ci && ci.product_id) || ""),
      name,
      brand: tx(d.brand_name) || d.brand || (ci && ci.brand) || "",
      variant: tx(d.variant) || (ci && ci.unit) || "",
      mrp,
      price,
      discountPct: round2(((mrp - price) / mrp) * 100),
      savings: round2(mrp - price),
      soldOut: d.is_sold_out === true || (ci && ci.inventory === 0) || d.inventory === 0,
      rating: Number.isFinite(ratingNum) ? ratingNum : null,
      ratingCount: d.rating && d.rating.count != null ? tx(d.rating.count) : "",
      badge,
      image: typeof img === "string" && img.startsWith("https://") ? img : "",
    };
  }

  // Walks the response structure safely
  function parseItems(json) {
    const out = [];
    (function walk(node, depth) {
      if (!node || typeof node !== "object" || depth > 14) return;
      if (Array.isArray(node)) { node.forEach((n) => walk(n, depth + 1)); return; }
      const d = node.data;
      if (d && typeof d === "object" && !Array.isArray(d)) {
        const item = toItem(d);
        if (item) { out.push(item); return; }
      }
      for (const k in node) walk(node[k], depth + 1);
    })(json && json.response ? json.response : json, 0);
    return out;
  }

  // ---------- Category Listing API ----------
  async function listingPage(o, offset, pageIdx, sort, sortIn) {
    const body = {
      offset: String(offset),
      limit: String(LIMIT),
      collection_filters: "[]",
      collection_group_id: String(o.group),
      collection_properties: JSON.stringify([{ id: 4179, name: "NEXT_PRODUCT_RECOMMENDATION", value: "true" }]),
      collection_uuid: o.cat,
      exclude_combos: "false",
      last_snippet_type: "product_card_snippet_type_2",
      last_widget_type: "product_container",
      oos_visibility: "true",
      page_index: String(pageIdx),
      products: "[]",
      total_entities_processed: String(pageIdx),
      total_pagination_items: String(LIMIT * MAX_PAGES),
      applied_filters: null,
    };
    if (sort) {
      body.sort = { field: sort, order: sortIn === "asc" ? 0 : 1 };
      body.sort_type = sort;
      body.sort_order = sortIn === "asc" ? "ASC" : "DESC";
    }
    const r = await fetch("https://blinkit.com/v1/layout/listing/paginated", {
      method: "POST",
      signal: o.signal,
      headers: { "content-type": "application/json", app_client: "consumer_web", lat: CTX.lat, lon: CTX.lon },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }

  // ---------- Category Crawler ----------
  async function crawl(o, onProgress) {
    const seen = new Set();
    const items = [];
    let pageIdx = 0, offset = 0, failedPages = 0, complete = false;

    // Page 0 initial
    const p0 = await listingPage(o, 0, 0);
    const it0 = parseItems(p0);
    it0.forEach((it) => {
      const key = it.productId || (it.name + "|" + it.variant);
      if (!seen.has(key)) { seen.add(key); items.push(it); }
    });
    pageIdx = 1;
    offset = items.length;
    onProgress(items.length, 1);
    if (!it0.length || it0.length < LIMIT) return { items, complete: true, partial: false };

    // Parallel batches
    while (pageIdx < MAX_PAGES) {
      const batchIndices = [];
      for (let i = 0; i < CONCURRENCY && pageIdx + i < MAX_PAGES; i++) batchIndices.push(pageIdx + i);
      const jobs = batchIndices.map((idx, i) =>
        listingPage(o, offset + i * LIMIT, idx)
          .then((res) => ({ ok: true, items: parseItems(res), idx }))
          .catch((err) => ({ ok: false, err, idx }))
      );
      const results = await Promise.all(jobs);
      let newCount = 0, hitEnd = false;
      for (const res of results) {
        if (!res.ok) { failedPages++; continue; }
        for (const it of res.items) {
          const key = it.productId || (it.name + "|" + it.variant);
          if (!seen.has(key)) { seen.add(key); items.push(it); newCount++; }
        }
        if (!res.items.length || res.items.length < LIMIT) hitEnd = true;
      }
      pageIdx += batchIndices.length;
      offset += batchIndices.length * LIMIT;
      onProgress(items.length, pageIdx);
      if (hitEnd || newCount === 0) { complete = true; break; }
      await sleep(150);
    }
    return { items, complete: complete || pageIdx >= MAX_PAGES, partial: failedPages > 0 };
  }

  // ---------- Keyword Search Crawler ----------
  async function crawlSearch(keyword, onProgress, signal) {
    const seen = new Set();
    const items = [];
    let pageIdx = 0, complete = false, partial = false;
    const MAX_SEARCH_PAGES = 35; // safety cap

    while (!complete && pageIdx < MAX_SEARCH_PAGES) {
      if (signal && signal.aborted) throw new DOMException("Aborted", "AbortError");

      const body = {
        query: keyword,
        page_index: pageIdx,
        offset: pageIdx * 15,
        limit: 15,
        oos_visibility: "true",
      };

      let json = null;
      try {
        const res = await fetch("https://blinkit.com/v1/layout/search", {
          method: "POST",
          signal,
          headers: {
            "content-type": "application/json",
            app_client: "consumer_web",
            lat: CTX.lat,
            lon: CTX.lon,
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        json = await res.json();
      } catch (err) {
        if (err.name === "AbortError") throw err;
        partial = true;
        break;
      }

      const list = parseItems(json);
      const beforeCount = items.length;

      if (list && list.length > 0) {
        list.forEach((it) => {
          const key = it.productId || (it.name + "|" + it.variant);
          if (!seen.has(key)) {
            seen.add(key);
            items.push(it);
          }
        });
      }

      if (!list || list.length === 0 || items.length === beforeCount) {
        complete = true;
      }

      pageIdx++;
      onProgress(items.length, pageIdx);

      if (!complete && pageIdx < MAX_SEARCH_PAGES) {
        await sleep(500); // 500ms courtesy pause between page calls
      }
    }

    return { items, complete, partial, pagesScanned: pageIdx };
  }

  // ---------- Results page (runs inside the new tab) ----------
  const RESULTS_CSS = `
:root{--bg:#fff;--fg:#171a17;--muted:#667064;--line:#e4e7e1;--soft:#f4f6f2;--accent:#0c831f;--accent-ink:#fff;--tint:#e6f4e8}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:13px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
button,input,select{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.wrap{max-width:1120px;margin:0 auto;padding:20px 16px 48px}
h1{margin:0;font-size:18px;font-weight:650}
.meta{margin-top:2px;color:var(--muted);display:flex;flex-wrap:wrap;gap:4px 14px}
.note{margin-top:10px;padding:8px 10px;border-radius:6px;background:var(--soft);color:var(--muted)}
.bar{position:sticky;top:0;z-index:2;background:var(--bg);display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 0;margin-top:8px;border-bottom:1px solid var(--line)}
.search{flex:1 1 200px;max-width:280px;height:30px;padding:0 10px;border:1px solid var(--line);border-radius:6px;background:var(--bg)}
.chip,.seg button{height:30px;padding:0 10px;border:1px solid var(--line);border-radius:6px;background:var(--bg);cursor:pointer}
.chip[aria-pressed=true]{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.sel{height:30px;padding:0 8px;border:1px solid var(--line);border-radius:6px;background:var(--bg)}
.seg{display:flex}.seg button{border-radius:0}.seg button:first-child{border-radius:6px 0 0 6px}.seg button:last-child{border-radius:0 6px 6px 0;border-left:0}
.seg button[aria-pressed=true]{background:var(--soft);font-weight:600}
.sp{flex:1}
.count{color:var(--muted);padding:8px 0}
table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
th{position:sticky;top:55px;background:var(--bg);text-align:right;font-weight:500;color:var(--muted);padding:6px 10px;border-bottom:1px solid var(--line);white-space:nowrap}
th:first-child,td:first-child{text-align:left}
th button{border:0;background:none;color:inherit;cursor:pointer;padding:0}
th[aria-sort] button{color:var(--fg);font-weight:600}
td{padding:7px 10px;border-bottom:1px solid var(--line);text-align:right;vertical-align:middle;white-space:nowrap}
tr:hover td{background:var(--soft)}
.prod{display:flex;align-items:center;gap:10px;white-space:normal;min-width:240px}
.prod img,.ph{width:48px;height:48px;flex:none;object-fit:contain;border-radius:6px;background:var(--soft)}
.pn{font-weight:500}
.ps{display:flex;gap:8px;color:var(--muted);font-size:12px}
.oos{opacity:.5}
.tag{font-size:11px;padding:0 6px;border-radius:4px;background:var(--soft);color:var(--muted)}
.mrp{color:var(--muted);text-decoration:line-through}
.price{font-weight:650}
.off{display:inline-block;min-width:44px;padding:1px 6px;border-radius:4px;font-weight:600;text-align:center}
.off.lo{color:var(--muted)}.off.mid{background:var(--tint);color:var(--accent)}.off.hi{background:var(--accent);color:var(--accent-ink)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;padding-top:6px}
.card{border:1px solid var(--line);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px;background:#fff;transition:box-shadow .12s}
.card:hover{box-shadow:0 3px 10px rgba(0,0,0,.06)}
.thumb{position:relative;width:100%;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:6px;overflow:hidden}
.thumb img{width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;display:block}
.thumb .ph{width:100%;height:100%;background:var(--soft)}
.thumb .off{position:absolute;left:6px;top:6px;z-index:1;box-shadow:0 1px 3px rgba(0,0,0,.15)}
.cname{font-weight:500;font-size:13px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:35px}
.cmeta{color:var(--muted);font-size:11px}
.cprice{display:flex;gap:6px;align-items:baseline;margin-top:auto;padding-top:2px}
.cprice b{font-size:14px;font-weight:650;color:#171a17}
.cprice s{color:var(--muted);font-size:12px}
.empty{padding:40px 0;text-align:center;color:var(--muted)}

@media (max-width:640px){
  .wrap{padding:12px 10px 40px}
  h1{font-size:16px}
  .meta{font-size:11px;gap:4px 8px}
  .bar{padding:8px 0;gap:6px}
  .search{flex:1 1 100%;max-width:100%;height:32px}
  .grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .card{padding:6px;gap:4px}
  .cname{font-size:12px;min-height:32px}
  .cmeta{font-size:11px}
  .cprice b{font-size:13px}
  .hide-s{display:none!important}
}
`;

  function pageMain() {
    const D = JSON.parse(document.getElementById("data").textContent);
    const h = (tag, a, ...kids) => {
      const e = document.createElement(tag);
      for (const k in a || {}) {
        if (k === "class") e.className = a[k];
        else if (k === "text") e.textContent = a[k];
        else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), a[k]);
        else e.setAttribute(k, a[k]);
      }
      kids.flat().forEach((c) => c != null && e.append(c.nodeType ? c : document.createTextNode(c)));
      return e;
    };
    const inr = (n) => "\u20B9" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
    // Default view: GRID
    const st = { q: "", minDisc: 0, inStock: false, key: "discountPct", dir: -1, view: "grid" };
    const SORTS = [
      ["discountPct:-1", "Highest discount"], ["savings:-1", "Biggest savings"], ["price:1", "Price, low to high"],
      ["price:-1", "Price, high to low"], ["rating:-1", "Top rated"], ["name:1", "Name, A to Z"],
    ];

    function visible() {
      const q = st.q.trim().toLowerCase();
      const list = D.items.filter((it) =>
        (!q || (it.name + " " + it.brand + " " + it.variant).toLowerCase().includes(q)) &&
        it.discountPct >= st.minDisc && (!st.inStock || !it.soldOut));
      list.sort((a, b) => {
        let av = a[st.key], bv = b[st.key];
        if (av == null || bv == null) return av == null ? (bv == null ? 0 : 1) : -1;
        const c = typeof av === "string" ? av.localeCompare(bv) * st.dir : (av - bv) * st.dir;
        return c || b.discountPct - a.discountPct || b.savings - a.savings || a.name.localeCompare(b.name);
      });
      return list;
    }

    const off = (it) => it.discountPct > 0
      ? h("span", { class: "off " + (it.discountPct >= 40 ? "hi" : it.discountPct >= 25 ? "mid" : "lo"), text: Math.round(it.discountPct) + "%" })
      : h("span", { class: "off lo", text: "\u2013" });
    const pic = (it) => it.image ? h("img", { src: it.image, alt: "", loading: "lazy", referrerpolicy: "no-referrer" }) : h("div", { class: "ph" });

    const COLS = [["name", "Product", 1], ["mrp", "MRP", 1], ["price", "Price", 1], ["discountPct", "Off", -1], ["savings", "Save", -1], ["rating", "Rating", -1]];

    function listView(rows) {
      const head = h("tr", {}, COLS.map(([key, label, dir]) => {
        const th = h("th", { class: key === "mrp" || key === "rating" ? "hide-s" : "" },
          h("button", { text: label + (st.key === key ? (st.dir < 0 ? " \u2193" : " \u2191") : ""), onclick: () => {
            if (st.key === key) st.dir *= -1; else { st.key = key; st.dir = dir; }
            render();
          } }));
        if (st.key === key) th.setAttribute("aria-sort", st.dir < 0 ? "descending" : "ascending");
        return th;
      }));
      const body = rows.map((it) => h("tr", { class: it.soldOut ? "oos" : "" },
        h("td", {}, h("div", { class: "prod" }, pic(it), h("div", {},
          h("div", { class: "pn", text: it.name }),
          h("div", { class: "ps" }, h("span", { text: it.variant }), h("span", { text: it.brand }), it.soldOut ? h("span", { class: "tag", text: "Sold out" }) : null)))),
        h("td", { class: "hide-s" }, it.discountPct > 0 ? h("span", { class: "mrp", text: inr(it.mrp) }) : ""),
        h("td", { class: "price", text: inr(it.price) }),
        h("td", {}, off(it)),
        h("td", { text: it.savings > 0 ? inr(it.savings) : "\u2013" }),
        h("td", { class: "hide-s", text: it.rating ? "\u2605 " + it.rating + (it.ratingCount ? " (" + it.ratingCount + ")" : "") : "\u2013" })));
      return h("table", {}, h("thead", {}, head), h("tbody", {}, body));
    }

    function gridView(rows) {
      return h("div", { class: "grid" }, rows.map((it) => h("article", { class: "card" + (it.soldOut ? " oos" : "") },
        h("div", { class: "thumb" }, pic(it), it.discountPct > 0 ? off(it) : null),
        h("div", { class: "cname", text: it.name }),
        h("div", { class: "cmeta", text: it.soldOut ? "Sold out" : it.variant }),
        h("div", { class: "cprice" }, h("b", { text: inr(it.price) }), it.discountPct > 0 ? h("s", { text: inr(it.mrp) }) : null))));
    }

    function exportCsv() {
      const q = (v) => {
        let s = String(v == null ? "" : v);
        if (/^[=+\-@]/.test(s)) s = "'" + s;
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      };
      const lines = [["Name", "Brand", "Variant", "MRP", "Price", "Discount %", "Savings", "In stock", "Rating"]]
        .concat(visible().map((i) => [i.name, i.brand, i.variant, i.mrp, i.price, i.discountPct, i.savings, i.soldOut ? "no" : "yes", i.rating]))
        .map((r) => r.map(q).join(","));
      const a = h("a", { href: URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" })), download: "blinkit-deals.csv" });
      document.body.append(a); a.click(); a.remove();
    }

    // Header summary
    const maxOff = D.items.reduce((m, i) => Math.max(m, i.discountPct), 0);
    const inStockN = D.items.filter((i) => !i.soldOut).length;
    const notes = [];
    if (D.partial) notes.push("Some pages failed to load, so this list may be incomplete.");
    if (D.cancelled) notes.push("Search stopped early by user. Showing " + D.items.length + " products collected so far.");
    else if (!D.complete) notes.push("Stopped at the safety limit of " + D.items.length + " products, so the rest of this subcategory isn't included.");

    const count = h("div", { class: "count" });
    const content = h("div", {});
    const mkChip = (label, on) => { const b = h("button", { class: "chip", "aria-pressed": "false", text: label, onclick: () => { on(); render(); } }); return b; };
    const c25 = mkChip("25%+", () => { st.minDisc = st.minDisc === 25 ? 0 : 25; });
    const c40 = mkChip("40%+", () => { st.minDisc = st.minDisc === 40 ? 0 : 40; });
    const cStock = mkChip("In stock", () => { st.inStock = !st.inStock; });
    const sel = h("select", { class: "sel", "aria-label": "Sort", onchange: () => { const [k, d] = sel.value.split(":"); st.key = k; st.dir = +d; render(); } },
      h("option", { value: "", hidden: "", text: "Column sort" }), SORTS.map(([v, t]) => h("option", { value: v, text: t })));
    const vGrid = h("button", { text: "Grid", onclick: () => { st.view = "grid"; render(); } });
    const vList = h("button", { text: "List", onclick: () => { st.view = "list"; render(); } });
    const search = h("input", { class: "search", type: "search", placeholder: "Search products or brands", "aria-label": "Search products", oninput: () => { st.q = search.value; render(); } });

    document.getElementById("app").append(h("div", { class: "wrap" },
      h("h1", { text: D.meta.category + " \u203A " + D.meta.subcategory }),
      h("div", { class: "meta" },
        h("span", { text: D.items.length + " products" }), h("span", { text: "up to " + Math.round(maxOff) + "% off" }),
        h("span", { text: inStockN + " in stock" }), h("span", { text: D.meta.locality }),
        h("span", { text: new Date(D.meta.at).toLocaleString() })),
      notes.map((n) => h("div", { class: "note", text: n })),
      h("div", { class: "bar" }, search, c25, c40, cStock, h("span", { class: "sp" }), sel,
        h("div", { class: "seg" }, vGrid, vList), h("button", { class: "chip", text: "Export CSV", onclick: exportCsv })),
      count, content));

    function render() {
      const rows = visible();
      c25.setAttribute("aria-pressed", st.minDisc === 25); c40.setAttribute("aria-pressed", st.minDisc === 40);
      cStock.setAttribute("aria-pressed", st.inStock);
      vGrid.setAttribute("aria-pressed", st.view === "grid"); vList.setAttribute("aria-pressed", st.view === "list");
      sel.value = SORTS.some(([v]) => v === st.key + ":" + st.dir) ? st.key + ":" + st.dir : "";
      count.textContent = "Showing " + rows.length + " of " + D.items.length;
      content.replaceChildren(rows.length ? (st.view === "grid" ? gridView(rows) : listView(rows)) : h("div", { class: "empty", text: "No products match these filters." }));
    }
    render();
  }

  function buildResultsHtml(data) {
    const json = JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    const title = data.meta.subcategory + " deals";
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
      esc(title) + '</title><style>' + RESULTS_CSS + '</style></head><body><div id="app"></div><script id="data" type="application/json">' +
      json + '</script><script>(' + pageMain.toString() + ')()</script></body></html>';
  }

  // Opens results only AFTER fetching is done
  let lastResultsHtml = null;

  function showOverlay(html) {
    let frame = document.getElementById("dh-overlay");
    if (frame) frame.remove();
    frame = document.createElement("div");
    frame.id = "dh-overlay";
    frame.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:#fff;display:flex;flex-direction:column";

    const topBar = document.createElement("div");
    topBar.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:10px 16px;background:#f8f9fa;border-bottom:1px solid #e4e7e1";

    const title = document.createElement("span");
    title.style.cssText = "font:600 13px system-ui;color:#171a17";
    title.textContent = "Deal Hunter Results";

    const right = document.createElement("div");
    right.style.cssText = "display:flex;gap:8px;align-items:center";

    const note = document.createElement("span");
    note.style.cssText = "font:12px system-ui;color:#667064";
    note.textContent = "Pop-up blocked by browser:";

    const openTabBtn = document.createElement("button");
    openTabBtn.textContent = "Open in New Tab \u2197";
    openTabBtn.style.cssText = "padding:5px 12px;background:#0c831f;color:#fff;border:0;border-radius:6px;font:600 12px system-ui;cursor:pointer";
    openTabBtn.onclick = () => {
      const w = window.open("", "_blank");
      if (w) { w.document.open(); w.document.write(html); w.document.close(); }
    };

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close \u2715";
    closeBtn.style.cssText = "padding:5px 12px;background:#fff;color:#667064;border:1px solid #e4e7e1;border-radius:6px;font:500 12px system-ui;cursor:pointer";
    closeBtn.onclick = () => frame.remove();

    right.append(note, openTabBtn, closeBtn);
    topBar.append(title, right);

    const f = document.createElement("iframe");
    f.setAttribute("sandbox", "allow-scripts allow-downloads");
    f.style.cssText = "flex:1;border:0;width:100%";
    f.srcdoc = html;

    frame.append(topBar, f);
    document.body.append(frame);
  }

  function displayResults(html) {
    lastResultsHtml = html;
    $("view-last").hidden = false;
    let opened = false;
    try {
      const w = window.open("", "_blank");
      if (w) {
        w.document.open();
        w.document.write(html);
        w.document.close();
        opened = true;
      }
    } catch (e) {
      opened = false;
    }
    if (!opened) {
      showOverlay(html);
      return "overlay";
    }
    return "tab";
  }

  // ---------- Sidebar (Claude's Pure Light Theme UI) ----------
  const CSS = `
:host{all:initial}
*,*::before,*::after{box-sizing:border-box}
.root{--bg:#fff;--fg:#171a17;--muted:#667064;--line:#e4e7e1;--soft:#f4f6f2;--accent:#0c831f;--accent-ink:#fff;--warn-bg:#fff6e0;--warn-fg:#7a4b00;--bad:#b3261e;
font:13px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--fg)}
[hidden]{display:none!important}
button,select,input{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.launcher{position:fixed;right:0;top:50%;transform:translateY(-50%);width:34px;height:44px;border:0;border-radius:10px 0 0 10px;background:var(--accent);color:var(--accent-ink);cursor:pointer;display:grid;place-items:center;box-shadow:-2px 2px 10px rgba(0,0,0,.18);transition:width .12s}
.launcher:hover{width:40px}
.open .launcher{display:none}
.drawer{position:fixed;top:0;right:0;height:100vh;width:320px;max-width:100vw;background:var(--bg);border-left:1px solid var(--line);box-shadow:-10px 0 30px rgba(0,0,0,.1);display:flex;flex-direction:column;transform:translateX(100%);visibility:hidden;transition:transform .18s ease,visibility 0s .18s;z-index:9999}
.open .drawer{transform:none;visibility:visible;transition-delay:0s}
header{display:flex;justify-content:space-between;align-items:flex-start;padding:14px 16px 10px}
.title{font-size:15px;font-weight:650}
.sub{margin-top:1px;color:var(--muted);font-size:12px}
.icon{width:28px;height:28px;border:0;border-radius:6px;background:none;color:var(--muted);font-size:20px;line-height:1;cursor:pointer}
.icon:hover{background:var(--soft)}
.warn{margin:0 16px 10px;padding:8px 10px;border-radius:6px;background:var(--warn-bg);color:var(--warn-fg);font-size:12px}
.body{flex:1;overflow:auto;padding:0 16px 12px;display:flex;flex-direction:column;gap:10px}
label{display:flex;flex-direction:column;gap:4px;color:var(--muted);font-size:12px;font-weight:500}
select,input{width:100%;height:30px;padding:0 8px;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:6px}
select:disabled,input:disabled{opacity:.55}
.seg{display:grid;grid-template-columns:1fr 1fr;padding:2px;border-radius:8px;background:var(--soft)}
.seg button{height:26px;border:0;border-radius:6px;background:none;color:var(--muted);font-weight:500;cursor:pointer}
.seg button[aria-selected=true]{background:var(--bg);color:var(--fg);box-shadow:0 0 0 1px var(--line)}
.primary{height:32px;border:0;border-radius:6px;background:var(--accent);color:var(--accent-ink);font-weight:600;cursor:pointer}
.primary:disabled{opacity:.45;cursor:not-allowed}
.link{padding:0;border:0;background:none;color:var(--accent);font-size:12px;text-decoration:underline;cursor:pointer}
.hint{margin:0;color:var(--muted);font-size:12px}
footer{padding:10px 16px 14px;border-top:1px solid var(--line);min-height:52px}
.progress{height:3px;margin-bottom:8px;border-radius:2px;background:var(--soft);overflow:hidden}
.progress i{display:block;height:100%;width:0;background:var(--accent);transition:width .15s}
.status{display:flex;justify-content:space-between;gap:8px;align-items:center;color:var(--muted);font-size:12px}
.status.error{color:var(--bad)}
@media (prefers-reduced-motion:reduce){.drawer,.progress i,.launcher{transition:none}}
`;

  const HTML = `
<div class="root" id="root">
  <button class="launcher" id="launcher" aria-label="Open Deal hunter" title="Deal hunter">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.2"/><circle cx="17" cy="17" r="2.2"/></svg>
  </button>
  <aside class="drawer" role="dialog" aria-label="Deal hunter">
    <header>
      <div><div class="title">Deal hunter</div><div class="sub" id="ctx"></div></div>
      <button class="icon" id="close" aria-label="Close">&times;</button>
    </header>
    <div class="warn" id="locwarn" hidden>⚠️ Delivery location not detected. Please select your delivery address on Blinkit so prices and stock match your store.</div>
    <div class="body">
      <div class="seg" role="tablist">
        <button role="tab" id="t-kw" aria-selected="true">Search by Keyword</button>
        <button role="tab" id="t-cat" aria-selected="false">Search by Category</button>
      </div>

      <!-- Keyword Search Tab Panel -->
      <section id="p-kw" style="display:flex;flex-direction:column;gap:10px">
        <label>Keyword<input id="kw-input" type="search" placeholder="e.g. sweets, snacks, amul, milk" autocomplete="off" /></label>
        <p class="hint">Fetches all pages matching this keyword (500ms pause between calls).</p>
        <button class="primary" id="kw-go" style="width:100%">Find keyword deals</button>
      </section>

      <!-- Category Deals Tab Panel -->
      <section id="p-cat" hidden style="display:flex;flex-direction:column;gap:10px">
        <label>Category<select id="cat"></select></label>
        <label>Subcategory<select id="sub" disabled><option>Choose a category first</option></select></label>
        <p class="hint">Fetches every page of the subcategory, then sorts by discount.</p>
        <button class="primary" id="go" style="width:100%" disabled>Find best deals</button>
      </section>
    </div>
    <footer>
      <div class="progress" id="prog" hidden><i id="bar"></i></div>
      <div class="status" id="statusrow">
        <span id="status" role="status">Ready. Enter a keyword or pick a category.</span>
        <button class="link" id="cancel" hidden>Cancel</button>
        <button class="link" id="view-last" hidden>View results &nearr;</button>
      </div>
    </footer>
  </aside>
</div>`;

  const host = document.createElement("div");
  host.id = ROOT_ID;
  host.style.cssText = "position:fixed;z-index:2147483647;top:0;right:0";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = "<style>" + CSS + "</style>" + HTML;
  document.body.appendChild(host);
  const $ = (id) => shadow.getElementById(id);

  const sel = { cat: null, sub: null };
  const groupCache = new Map();
  let busy = false, ctrl = null;

  function updateContextUI() {
    CTX = getDynamicContext();
    $("ctx").textContent = CTX.locality + (CTX.chainId ? ", store " + CTX.chainId : "");
    $("locwarn").hidden = CTX.detected;
  }
  updateContextUI();

  const setOpen = (open) => {
    $("root").classList.toggle("open", open);
    if (open) {
      updateContextUI();
      $("kw-input").focus();
    }
  };
  $("launcher").onclick = () => setOpen(true);
  $("close").onclick = () => setOpen(false);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

  function setStatus(msg, isError) {
    $("status").textContent = msg;
    $("statusrow").classList.toggle("error", !!isError);
  }
  function setBusy(on) {
    busy = on;
    $("go").disabled = on || !sel.sub;
    $("kw-go").disabled = on;
    $("kw-input").disabled = on;
    $("cat").disabled = on;
    $("sub").disabled = on || !sel.cat;
    $("t-kw").disabled = on;
    $("t-cat").disabled = on;
    $("cancel").hidden = !on;
    $("prog").hidden = !on;
    if (!on) $("bar").style.width = "0";
  }
  const setProgress = (f) => { $("bar").style.width = Math.round(Math.min(1, f) * 100) + "%"; };
  $("cancel").onclick = () => ctrl && ctrl.abort();

  $("view-last").onclick = () => {
    if (lastResultsHtml) {
      const w = window.open("", "_blank");
      if (w) { w.document.open(); w.document.write(lastResultsHtml); w.document.close(); }
      else { showOverlay(lastResultsHtml); }
    }
  };

  // Tabs: Search by Keyword / Search by Category
  function showTab(name) {
    const isKw = name === "kw";
    $("t-kw").setAttribute("aria-selected", isKw);
    $("t-cat").setAttribute("aria-selected", !isKw);
    $("p-kw").hidden = !isKw;
    $("p-cat").hidden = isKw;
    if (isKw) $("kw-input").focus();
    else if (!$("cat").value) $("cat").focus();
  }
  $("t-kw").onclick = () => showTab("kw");
  $("t-cat").onclick = () => showTab("cat");

  // Populate Categories Dropdown (Claude's original optgroups)
  (function fillCategories() {
    const c = $("cat");
    c.innerHTML = "";
    const first = document.createElement("option");
    first.value = ""; first.textContent = "Choose a category";
    c.appendChild(first);
    const groups = {};
    TAXONOMY.forEach((col, idx) => (groups[col.superCategory || "Other"] = groups[col.superCategory || "Other"] || []).push({ col, idx }));
    Object.keys(groups).forEach((sc) => {
      const og = document.createElement("optgroup");
      og.label = sc;
      groups[sc].forEach(({ col, idx }) => {
        const o = document.createElement("option");
        o.value = idx; o.textContent = col.name;
        og.appendChild(o);
      });
      c.appendChild(og);
    });
  })();

  function fillSubs(groups) {
    const s = $("sub");
    s.innerHTML = "";
    const first = document.createElement("option");
    first.value = ""; first.textContent = "Choose a subcategory (" + groups.length + ")";
    s.appendChild(first);
    groups.forEach((g, i) => {
      const o = document.createElement("option");
      o.value = i; o.textContent = g.name;
      s.appendChild(o);
    });
    s.disabled = false;
    s.onchange = () => {
      sel.sub = s.value === "" ? null : groups[+s.value];
      setBusy(false);
      setStatus(sel.sub ? "Ready." : "Pick a subcategory.");
    };
  }

  async function loadSubs(cat) {
    if (groupCache.has(cat.uuid)) { fillSubs(groupCache.get(cat.uuid)); return; }
    const s = $("sub");
    s.disabled = true;
    s.innerHTML = "<option>Loading subcategories\u2026</option>";
    let groups = [];
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 6000);
      const res = await fetch("https://blinkit.com/v1/layout/listing", {
        method: "POST",
        signal: c.signal,
        headers: { "content-type": "application/json", app_client: "consumer_web", lat: CTX.lat, lon: CTX.lon },
        body: JSON.stringify({ collection_uuid: cat.uuid }),
      });
      clearTimeout(t);
      if (res.ok) {
        const json = await res.json();
        ((json && json.response && json.response.snippets) || []).forEach((sn) => {
          const d = sn.data || {};
          const meta = (sn.tracking && sn.tracking.widget_meta) || {};
          const title = (d.selected_title && d.selected_title.text) || (d.unselected_title && d.unselected_title.text) || meta.widget_title || "";
          if (title && meta.widget_id && !groups.some((g) => g.id === meta.widget_id)) groups.push({ id: meta.widget_id, name: title });
        });
      }
    } catch (e) { /* use bundled list */ }
    if (!groups.length) groups = cat.groupings || [];
    groupCache.set(cat.uuid, groups);
    if (sel.cat === cat) fillSubs(groups);
  }

  $("cat").onchange = () => {
    const v = $("cat").value;
    sel.sub = null;
    setBusy(false);
    if (v === "") {
      sel.cat = null;
      $("sub").innerHTML = "<option>Choose a category first</option>";
      $("sub").disabled = true;
      setStatus("Pick a category to start.");
      return;
    }
    sel.cat = TAXONOMY[+v];
    setStatus("Loading subcategories\u2026");
    loadSubs(sel.cat);
  };

  function request(extra) {
    ctrl = new AbortController();
    return Object.assign({ cat: sel.cat.uuid, group: sel.sub.id, oos: "true", signal: ctrl.signal }, extra);
  }

  // Category deals fetch: opens results ONLY AFTER fetch completes
  $("go").onclick = async () => {
    if (busy || !sel.sub) return;
    updateContextUI();
    if (!CTX.detected) {
      setStatus("Please select your delivery address on Blinkit first.", true);
      return;
    }
    let o;
    try { o = request({}); } catch (e) { setStatus(e.message, true); return; }
    setBusy(true);
    setStatus("Scanning subcategory\u2026");
    try {
      const r = await crawl(o, (n, p) => { setProgress(1 - 1 / (1 + p / 8)); setStatus("Scanned " + n + " products, " + p + " pages\u2026"); });
      if (!r.items.length) throw new Error("No products returned. Try another subcategory.");
      r.items.sort((a, b) => b.discountPct - a.discountPct || b.savings - a.savings);
      const html = buildResultsHtml({
        items: r.items, complete: r.complete, partial: r.partial,
        meta: { category: sel.cat.name, subcategory: sel.sub.name, locality: CTX.locality, chainId: CTX.chainId, at: Date.now() },
      });
      const mode = displayResults(html);
      setStatus("Done! Found " + r.items.length + " products" + (mode === "tab" ? ". Opened in a new tab." : "."));
    } catch (e) {
      setStatus(e.name === "AbortError" ? "Cancelled." : e.message, e.name !== "AbortError");
    } finally { setBusy(false); }
  };

  // Keyword deals fetch: opens results ONLY AFTER fetch completes
  async function executeKeywordSearch() {
    const q = ($("kw-input").value || "").trim();
    if (!q) {
      setStatus("Please enter a keyword to search.", true);
      $("kw-input").focus();
      return;
    }
    if (busy) return;

    updateContextUI();
    if (!CTX.detected) {
      setStatus("Please select your delivery address on Blinkit first.", true);
      return;
    }

    // Check session cache first
    const cacheKey = q.toLowerCase();
    if (searchCache.has(cacheKey)) {
      const cached = searchCache.get(cacheKey);
      const html = buildResultsHtml({
        items: cached.items, complete: cached.complete, partial: cached.partial, cancelled: false,
        meta: { category: 'Search: "' + q + '"', subcategory: cached.items.length + " products (" + cached.pagesScanned + " pages)", locality: CTX.locality, chainId: CTX.chainId, at: Date.now() },
      });
      const mode = displayResults(html);
      setStatus("Loaded " + cached.items.length + " products from session cache" + (mode === "tab" ? ". Opened in a new tab." : "."));
      return;
    }

    ctrl = new AbortController();
    setBusy(true);
    setStatus("Searching '" + q + "' (page 1)...");
    setProgress(0.05);

    try {
      const r = await crawlSearch(q, (count, pages) => {
        setProgress(Math.min(0.95, pages / 15));
        setStatus("Found " + count + " products (" + pages + " pages, 500ms pause)...");
      }, ctrl.signal);

      if (!r.items.length) {
        throw new Error("No products returned for '" + q + "'. Try another keyword.");
      }

      r.items.sort((a, b) => b.discountPct - a.discountPct || b.savings - a.savings);

      // Save to cache
      searchCache.set(cacheKey, { items: r.items, complete: r.complete, partial: r.partial, pagesScanned: r.pagesScanned });

      const html = buildResultsHtml({
        items: r.items, complete: r.complete, partial: r.partial, cancelled: r.cancelled,
        meta: { category: 'Search: "' + q + '"', subcategory: r.items.length + " products (" + r.pagesScanned + " pages)", locality: CTX.locality, chainId: CTX.chainId, at: Date.now() },
      });
      const mode = displayResults(html);
      setStatus("Done! Found " + r.items.length + " products across " + r.pagesScanned + " pages" + (mode === "tab" ? ". Opened in new tab." : "."));
    } catch (e) {
      setStatus(e.name === "AbortError" ? "Search cancelled." : e.message, e.name !== "AbortError");
    } finally { setBusy(false); }
  }

  $("kw-go").onclick = executeKeywordSearch;
  $("kw-input").onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeKeywordSearch();
    }
  };

  setOpen(true);
})();
