/* =========================================================================
   Montinho Training Strategy — QR Codes (Módulo 8)
   Gera QR codes para os links (WhatsApp, Instagram) do PDF premium.
   Usa um serviço de imagem de QR (escaneável e sempre atualizado) e degrada
   com elegância quando estiver offline — o link fica sempre visível como texto,
   então nunca é um beco sem saída.
   ========================================================================= */
window.MTS = window.MTS || {};

MTS.QR = (function () {
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* Retorna um bloco com o QR (imagem) + rótulo + link, ou um placeholder. */
  function block(opts) {
    var data = opts.data, label = opts.label || '', size = opts.size || 150;
    var wrap = el('div', 'pg-qr');
    if (!data) return wrap;

    var img = document.createElement('img');
    img.width = size; img.height = size; img.alt = 'QR Code ' + label;
    img.loading = 'lazy';
    img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size +
      '&margin=0&data=' + encodeURIComponent(data);
    img.className = 'pg-qr__img';
    img.addEventListener('error', function () {
      var ph = el('div', 'pg-qr__ph');
      ph.style.width = size + 'px'; ph.style.height = size + 'px';
      ph.innerHTML = '<span>QR</span>';
      if (img.parentNode) img.parentNode.replaceChild(ph, img);
    });
    wrap.appendChild(img);
    if (label) wrap.appendChild(el('div', 'pg-qr__lbl', label));
    return wrap;
  }

  /* Normaliza número de WhatsApp e handle do Instagram em links. */
  function whatsappLink(num) {
    var digits = String(num || '').replace(/\D/g, '');
    return digits ? 'https://wa.me/' + digits : '';
  }
  function instagramLink(handle) {
    var h = String(handle || '').trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/$/, '');
    return h ? 'https://instagram.com/' + h : '';
  }

  return { block: block, whatsappLink: whatsappLink, instagramLink: instagramLink };
})();
