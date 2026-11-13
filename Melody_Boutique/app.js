(() => {
  "use strict";
  const config = window.STORE_CONFIG || {};
  const products = window.PRODUCTS || [];
  const IMAGE_FOLDER = "images/";
  const CATEGORY_LABELS = { tops: "تاپ و شومیز", dresses: "پیراهن", outerwear: "مانتو و کت", bottoms: "شلوار و دامن", bags: "کیف", accessories: "اکسسوری" };
  const $ = (s, root = document) => root.querySelector(s);
  const money = n => `${Math.round(n).toLocaleString("fa-IR")} ${config.currency || "تومان"}`;
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  // یکسان‌سازی حروف فارسی/عربی و نیم‌فاصله برای جست‌وجوی راحت‌تر
  const normalize = value => String(value ?? "").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[‌‏‎]/g, " ").toLowerCase().trim();
  const safeRead = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const state = {
    cart: safeRead("melody-cart", []), favorites: safeRead("melody-favorites", []),
    coupon: safeRead("melody-coupon", null), filter: "all", search: "", sort: "featured", selectedProduct: null
  };
  const save = () => {
    localStorage.setItem("melody-cart", JSON.stringify(state.cart));
    localStorage.setItem("melody-favorites", JSON.stringify(state.favorites));
    localStorage.setItem("melody-coupon", JSON.stringify(state.coupon));
  };
  const toast = message => {
    const el = $("#toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2400);
  };
  const getProduct = id => products.find(p => p.id === id);
  const isSaleActive = () => {
    const s = config.sale || {}; const now = Date.now();
    if (!s.enabled || !(s.percent > 0 && s.percent < 100)) return false;
    const start = s.startsAt ? new Date(s.startsAt).getTime() : -Infinity;
    const end = s.endsAt ? new Date(s.endsAt).getTime() : Infinity;
    return now >= start && now <= end;
  };
  const salePrice = p => isSaleActive() ? Math.round(p.price * (1 - config.sale.percent / 100)) : p.price;
  const categoryLabel = c => CATEGORY_LABELS[c] || "پوشاک";

  // عکس‌ها: اگر فقط اسم فایل بنویسی (مثلاً 1.jpg) از پوشه images خوانده می‌شود.
  const imageSrc = value => {
    const v = String(value ?? "").trim();
    if (!v) return "";
    return /^(https?:|data:|\/|images\/|assets\/)/i.test(v) ? v : IMAGE_FOLDER + v;
  };
  const productImages = p => {
    const list = Array.isArray(p.images) && p.images.length ? p.images : [p.image];
    return list.map(imageSrc).filter(Boolean);
  };
  const placeholder = (p, extra = "") => {
    const [first] = productImages(p);
    return first
      ? `<div class="product-photo ${extra}"><img src="${escapeHTML(first)}" alt="${escapeHTML(p.name)}" loading="lazy" onerror="this.remove()"></div>`
      : `<div class="product-photo image-placeholder ${extra}"><span>PRODUCT IMAGE</span><small>${escapeHTML(p.englishName || p.name)}</small></div>`;
  };
  const heart = p => `<button class="heart-button ${state.favorites.includes(p.id) ? "liked" : ""}" data-favorite="${escapeHTML(p.id)}" aria-label="افزودن به علاقه‌مندی‌ها">${state.favorites.includes(p.id) ? "♥" : "♡"}</button>`;

  // جست‌وجو: نام فارسی/انگلیسی، نام دسته (فارسی و انگلیسی)، رنگ، توضیح، برچسب‌ها و مشخصات
  const searchText = p => normalize([
    p.name, p.englishName, p.category, categoryLabel(p.category), p.description,
    ...(p.colors || []), ...(p.tags || []), ...Object.entries(p.specs || {}).flat()
  ].join(" "));
  const matchesSearch = (p, query) => {
    if (!query) return true;
    const text = searchText(p);
    return query.split(/\s+/).every(word => text.includes(word));
  };
  // فیلتر دسته: "all" یا نام یک دسته یا چند دسته با کاما (مثلاً "bags,accessories")
  const matchesFilter = p => state.filter === "all" || state.filter.split(",").includes(p.category);

  const productCard = p => {
    const old = salePrice(p) < p.price;
    return `<article class="product-card">
        <div class="product-visual" data-open-product="${escapeHTML(p.id)}">${placeholder(p)}
          ${p.badge ? `<span class="product-badge">${escapeHTML(p.badge)}</span>` : ""}
          ${heart(p)}
          <button class="quick-add" data-quick-add="${escapeHTML(p.id)}">افزودن سریع +</button>
        </div>
        <button class="product-info" data-open-product="${escapeHTML(p.id)}"><span class="product-en">${escapeHTML(p.englishName || "")}</span><strong>${escapeHTML(p.name)}</strong><span class="price-line">${old ? `<del>${money(p.price)}</del>` : ""}<b>${money(salePrice(p))}</b></span></button>
      </article>`;
  };
  const renderProducts = () => {
    const query = normalize(state.search);
    let list = products.filter(p => matchesFilter(p) && matchesSearch(p, query));
    if (state.sort === "price-asc") list.sort((a,b) => salePrice(a)-salePrice(b));
    if (state.sort === "price-desc") list.sort((a,b) => salePrice(b)-salePrice(a));
    if (state.sort === "newest") list.sort((a,b) => Number(!!b.isNew)-Number(!!a.isNew));
    $("#productGrid").innerHTML = list.map(productCard).join("");
    $("#emptyState").hidden = list.length !== 0;
    $("#resultCount").textContent = `${list.length.toLocaleString("fa-IR")} محصول`;
  };
  const renderFeatured = () => {
    const list = products.filter(p => p.featured);
    $("#featured").hidden = list.length === 0;
    $("#featuredGrid").innerHTML = list.map(productCard).join("");
  };
  const updateCounts = () => {
    $("#cartCount").textContent = state.cart.reduce((n, i) => n + i.qty, 0).toLocaleString("fa-IR");
    $("#favoriteCount").textContent = state.favorites.length.toLocaleString("fa-IR");
  };
  const openPanel = id => { closePanels(); $("#overlay").classList.add("active"); $(id).classList.add("open"); };
  const closePanels = () => { $("#overlay").classList.remove("active"); document.querySelectorAll(".drawer.open, .modal.open").forEach(el => el.classList.remove("open")); };
  const addToCart = (id, color = "", size = "") => {
    const p = getProduct(id); if (!p) return;
    const existing = state.cart.find(i => i.id === id && i.color === color && i.size === size);
    const currentQty = existing?.qty || 0;
    if (currentQty >= p.stock) return toast("تعداد انتخابی از موجودی بیشتر است.");
    if (existing) existing.qty++; else state.cart.push({ id, color, size, qty: 1 });
    save(); updateCounts(); renderCart(); toast("به سبد خرید اضافه شد.");
  };
  const changeQty = (index, delta) => {
    const item = state.cart[index], p = getProduct(item?.id); if (!item || !p) return;
    item.qty += delta;
    if (item.qty <= 0) state.cart.splice(index, 1);
    else if (item.qty > p.stock) { item.qty = p.stock; toast("بیشتر از موجودی قابل انتخاب نیست."); }
    save(); renderCart(); updateCounts();
  };
  const validCoupon = () => {
    if (!state.coupon) return null;
    const code = String(state.coupon).trim().toUpperCase();
    const c = (config.coupons || []).find(x => x.code.toUpperCase() === code && x.active);
    if (!c) return null;
    const now = Date.now();
    if (c.startsAt && now < new Date(c.startsAt).getTime()) return null;
    if (c.endsAt && now > new Date(c.endsAt).getTime()) return null;
    if (c.maxUses > 0 && Number(localStorage.getItem(`melody-coupon-uses-${code}`) || 0) >= c.maxUses) return null;
    return c;
  };
  const totals = () => {
    let subtotal = 0, saleDiscount = 0;
    state.cart.forEach(i => { const p = getProduct(i.id); if (!p) return; subtotal += p.price*i.qty; saleDiscount += (p.price-salePrice(p))*i.qty; });
    const afterSale = subtotal-saleDiscount, c = validCoupon();
    let couponDiscount = 0;
    if (c && afterSale >= (c.minSubtotal || 0)) {
      const eligible = c.appliesTo === "all" ? afterSale : state.cart.reduce((sum,i) => {
        const p=getProduct(i.id); return sum + (p && (Array.isArray(c.appliesTo) ? c.appliesTo.includes(p.id) : p.category===c.appliesTo) ? salePrice(p)*i.qty : 0);
      },0);
      couponDiscount = c.type === "fixed" ? Math.min(c.value, eligible) : Math.round(eligible*c.value/100);
    }
    return { subtotal, saleDiscount, couponDiscount, grand: Math.max(0, afterSale-couponDiscount), coupon: c };
  };
  const renderCart = () => {
    const host = $("#cartItems");
    host.innerHTML = state.cart.length ? state.cart.map((i,index) => {
      const p=getProduct(i.id); if(!p) return "";
      return `<div class="cart-item">${placeholder(p)}<div class="cart-item-info"><strong>${escapeHTML(p.name)}</strong><small>${[i.color,i.size].filter(Boolean).map(escapeHTML).join(" / ") || "انتخاب پیش‌فرض"}</small><b>${money(salePrice(p)*i.qty)}</b><div class="qty-control"><button data-qty="${index}" data-delta="-1">−</button><span>${i.qty.toLocaleString("fa-IR")}</span><button data-qty="${index}" data-delta="1">+</button></div></div><button class="remove-item" data-remove="${index}" aria-label="حذف">×</button></div>`;
    }).join("") : `<div class="empty-cart"><span>YOUR BAG IS WAITING</span><p>سبد خریدت هنوز خالیه.</p><a href="#shop" class="button button-dark" data-close>رفتن به فروشگاه</a></div>`;
    const t=totals(); $("#subtotal").textContent=money(t.subtotal); $("#saleTotal").textContent=`− ${money(t.saleDiscount)}`; $("#couponTotal").textContent=`− ${money(t.couponDiscount)}`; $("#grandTotal").textContent=money(t.grand);
    $("#couponInput").value=state.coupon || "";
    $("#couponMessage").textContent=state.coupon ? (t.coupon ? `کد ${t.coupon.code} اعمال شد.` : "این کد معتبر نیست یا شرایط آن برقرار نیست.") : "کد تخفیف را وارد کن.";
    updateCounts();
  };
  const renderFavorites = () => {
    const host=$("#favoriteItems"), list=state.favorites.map(getProduct).filter(Boolean);
    host.innerHTML=list.length ? list.map(p=>`<div class="favorite-row">${placeholder(p)}<div><strong>${escapeHTML(p.name)}</strong><b>${money(salePrice(p))}</b><button class="small-link" data-open-product="${escapeHTML(p.id)}">مشاهده محصول ↗</button></div>${heart(p)}</div>`).join("") : `<div class="empty-cart"><span>YOUR FAVORITES</span><p>هنوز محصولی لایک نکردی.</p></div>`;
  };
  const toggleFavorite = id => {
    state.favorites.includes(id) ? state.favorites=state.favorites.filter(x=>x!==id) : state.favorites.push(id);
    save(); renderProducts(); renderFeatured(); renderFavorites(); updateCounts();
  };
  const openProduct = id => {
    const p=getProduct(id); if(!p) return; state.selectedProduct=p;
    const images = productImages(p);
    const thumbs = images.length > 1
      ? `<div class="detail-thumbs">${images.map((src, i) => `<button class="thumb ${i === 0 ? "selected" : ""}" data-thumb="${escapeHTML(src)}" aria-label="عکس ${i+1}"><img src="${escapeHTML(src)}" alt="" loading="lazy" onerror="this.remove()"></button>`).join("")}</div>`
      : "";
    $("#productDetail").innerHTML=`<div class="detail-layout"><div class="detail-gallery" id="gallery">${placeholder(p,"detail-photo")}${thumbs}</div><div class="detail-info"><p class="eyebrow">${escapeHTML(p.englishName || "MELODY COLLECTION")}</p><h2>${escapeHTML(p.name)}</h2><div class="detail-price">${salePrice(p)<p.price?`<del>${money(p.price)}</del>`:""}<strong>${money(salePrice(p))}</strong></div><p class="detail-description">${escapeHTML(p.description || "")}</p>
      ${p.colors?.length?`<label>رنگ: <strong id="chosenColor">${escapeHTML(p.colors[0])}</strong></label><div class="option-row" id="colorOptions">${p.colors.map((c,i)=>`<button class="option-button ${i===0?"selected":""}" data-color="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join("")}</div>`:""}
      ${p.sizes?.length?`<label>سایز</label><div class="option-row" id="sizeOptions">${p.sizes.map((s,i)=>`<button class="option-button ${i===0?"selected":""}" data-size="${escapeHTML(s)}">${escapeHTML(s)}</button>`).join("")}</div>`:""}
      <p class="stock-note">${p.stock>0?`موجودی: ${p.stock.toLocaleString("fa-IR")} عدد`:"ناموجود"}</p>
      <button class="button button-dark detail-add" id="detailAdd" ${p.stock<=0?"disabled":""}>افزودن به سبد خرید ↗</button><button class="detail-fav" data-favorite="${escapeHTML(p.id)}">${state.favorites.includes(p.id)?"♥ حذف از علاقه‌مندی‌ها":"♡ افزودن به علاقه‌مندی‌ها"}</button>
      <div class="spec-list"><h3>جزئیات محصول</h3>${Object.entries(p.specs||{}).map(([k,v])=>`<div><span>${escapeHTML(k)}</span><strong>${escapeHTML(v)}</strong></div>`).join("")}</div></div></div>`;
    $("#overlay").classList.add("active"); $("#productModal").classList.add("open");
    $("#detailAdd").addEventListener("click", () => {
      const selected = state.selectedProduct;
      if (!selected) return;
      const color = $("#colorOptions .selected")?.dataset.color || "";
      const size = $("#sizeOptions .selected")?.dataset.size || "";
      addToCart(selected.id, color, size);
      closePanels();
    });
  };
  const applyCoupon = () => {
    const code=$("#couponInput").value.trim().toUpperCase();
    const c=(config.coupons||[]).find(x=>x.code.toUpperCase()===code && x.active);
    const now=Date.now();
    if(!c || (c.startsAt && now<new Date(c.startsAt).getTime()) || (c.endsAt && now>new Date(c.endsAt).getTime())) { state.coupon=null; save(); renderCart(); $("#couponMessage").textContent="کد تخفیف معتبر نیست یا زمان آن تمام شده."; return; }
    state.coupon=code; save(); renderCart();
    const t=totals(); if(t.couponDiscount===0 && c.minSubtotal>t.subtotal) $("#couponMessage").textContent=`حداقل خرید برای این کد ${money(c.minSubtotal)} است.`;
    else toast("کد تخفیف اعمال شد.");
  };
  const orderText = () => {
    const t=totals();
    const lines=state.cart.map(i=>{const p=getProduct(i.id); return p?`• ${p.name} | رنگ: ${i.color||"انتخاب نشده"} | سایز: ${i.size||"ندارد"} | تعداد: ${i.qty} | مبلغ: ${money(salePrice(p)*i.qty)}`:"";}).filter(Boolean);
    return [`سلام Melody Boutique، می‌خواهم این سفارش را ثبت کنم:`,``,...lines,``,`جمع محصولات: ${money(t.subtotal)}`,`تخفیف محصولات: ${money(t.saleDiscount)}`,`کد تخفیف: ${t.coupon?.code || "ندارد"}`,`تخفیف کد: ${money(t.couponDiscount)}`,`مبلغ نهایی: ${money(t.grand)}`,``,`لطفاً برای هماهنگی سفارش راهنمایی‌ام کنید.`].join("\n");
  };
  const sendTelegramOrder = () => {
    if(!state.cart.length) return toast("سبد خرید خالی است.");
    const text=orderText();
    const share=`https://t.me/share/url?url=${encodeURIComponent(config.telegramProfileUrl || "https://t.me/"+config.telegramUsername)}&text=${encodeURIComponent(text)}`;
    window.open(share,"_blank","noopener");
  };
  document.addEventListener("click", e => {
    const target=e.target.closest("button, a");
    if(!target) return;
    if(target.dataset.thumb){
      const main=$("#gallery > .product-photo");
      if(main) main.outerHTML=`<div class="product-photo detail-photo"><img src="${escapeHTML(target.dataset.thumb)}" alt="" onerror="this.remove()"></div>`;
      document.querySelectorAll(".thumb").forEach(b=>b.classList.toggle("selected",b===target));
      return;
    }
    if(target.dataset.close!==undefined){closePanels();return;}
    if(target.dataset.favorite){toggleFavorite(target.dataset.favorite); if(state.selectedProduct?.id===target.dataset.favorite) openProduct(target.dataset.favorite);return;}
    if(target.dataset.openProduct){openProduct(target.dataset.openProduct);return;}
    if(target.dataset.quickAdd){addToCart(target.dataset.quickAdd);return;}
    if(target.dataset.qty!==undefined){changeQty(Number(target.dataset.qty),Number(target.dataset.delta));return;}
    if(target.dataset.remove!==undefined){state.cart.splice(Number(target.dataset.remove),1);save();renderCart();updateCounts();return;}
    if(target.dataset.filter){state.filter=target.dataset.filter;document.querySelectorAll(".filter-chip").forEach(b=>b.classList.toggle("active",b===target));renderProducts();return;}
    if(target.dataset.category){state.filter=target.dataset.category;document.querySelectorAll(".filter-chip").forEach(b=>b.classList.toggle("active",b.dataset.filter===state.filter));renderProducts();document.querySelector("#shop").scrollIntoView({behavior:"smooth"});return;}
    if(target.dataset.color){$("#colorOptions").querySelectorAll("button").forEach(b=>b.classList.toggle("selected",b===target));$("#chosenColor").textContent=target.dataset.color;return;}
    if(target.dataset.size){$("#sizeOptions").querySelectorAll("button").forEach(b=>b.classList.toggle("selected",b===target));return;}
  });
  $("#cartButton").addEventListener("click",()=>{renderCart();openPanel("#cartDrawer");});
  $("#favoritesButton").addEventListener("click",()=>{renderFavorites();openPanel("#favoritesDrawer");});
  $("#overlay").addEventListener("click",closePanels);
  document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",closePanels));
  $("#applyCoupon").addEventListener("click",applyCoupon);
  $("#couponInput").addEventListener("keydown",e=>{if(e.key==="Enter")applyCoupon();});
  $("#telegramOrder").addEventListener("click",sendTelegramOrder);
  $("#instagramOrder").href=config.instagramUrl;
  $("#footerTelegram").href=config.telegramProfileUrl;
  $("#footerInstagram").href=config.instagramUrl;
  $("#sortSelect").addEventListener("change",e=>{state.sort=e.target.value;renderProducts();});
  $("#searchInput").addEventListener("input",e=>{state.search=e.target.value;renderProducts();});
  $("#searchToggle").addEventListener("click",()=>{
    $("#shop").scrollIntoView({behavior:"smooth"});
    setTimeout(()=>$("#searchInput").focus(),400);
  });
  $("#mobileMenu").addEventListener("click",()=>$("#mainNav").classList.toggle("nav-open"));
  $("#year").textContent=new Date().getFullYear();
  if(isSaleActive()) $("#announcement").innerHTML=`${escapeHTML(config.sale.label || "SPECIAL SALE")} · ${config.sale.percent}% OFF · <span>MELODY BOUTIQUE</span>`;

  // هشدار در کنسول اگر شناسه تکراری یا دسته‌بندی اشتباه باشد
  const seenIds = new Set();
  products.forEach(p => {
    if (!p.id || seenIds.has(p.id)) console.warn(`[Melody] شناسه تکراری یا خالی: ${p.id}`);
    seenIds.add(p.id);
    if (!CATEGORY_LABELS[p.category]) console.warn(`[Melody] دسته‌بندی نامعتبر: ${p.name} (${p.category})`);
  });

  renderFeatured();renderProducts();renderCart();renderFavorites();updateCounts();
})();
