/**
 * سكربت صغير يُضمَّن في <head> ويعمل قبل React:
 * يضبط lang و dir و data-theme من الرابط (?lang=en) أو من تفضيل محفوظ،
 * فلا تظهر الصفحة بالاتجاه أو النمط الخطأ للحظة.
 */
export const bootScript = `(function(){try{var d=document.documentElement,q=new URLSearchParams(location.search).get('lang'),l=q||localStorage.getItem('suhad-lang');if(l==='en'||l==='ar'){d.lang=l;d.dir=l==='en'?'ltr':'rtl';}var t=localStorage.getItem('suhad-theme');if(t==='dark'||t==='light')d.setAttribute('data-theme',t);}catch(e){}})();`;
