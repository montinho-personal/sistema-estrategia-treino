/**
 * qr.js — Geração de QR Codes (WhatsApp e Instagram) usando qrcodejs.
 * Retorna um data URL (PNG) para ser embutido no documento/PDF.
 */
(function (global) {
  'use strict';

  function buildQrDataUrl(text, size, dark, light) {
    return new Promise(function (resolve) {
      if (!global.QRCode || !text) { resolve(''); return; }
      var holder = document.createElement('div');
      holder.style.position = 'absolute';
      holder.style.left = '-9999px';
      document.body.appendChild(holder);
      try {
        /* eslint-disable no-new */
        new global.QRCode(holder, {
          text: text,
          width: size || 160,
          height: size || 160,
          colorDark: dark || '#0B1220',
          colorLight: light || '#FFFFFF',
          correctLevel: global.QRCode.CorrectLevel.M
        });
      } catch (e) {
        document.body.removeChild(holder);
        resolve('');
        return;
      }
      // qrcodejs renderiza assíncrono em <img> ou <canvas>
      setTimeout(function () {
        var dataUrl = '';
        var canvas = holder.querySelector('canvas');
        var img = holder.querySelector('img');
        try {
          if (canvas && canvas.toDataURL) dataUrl = canvas.toDataURL('image/png');
          else if (img && img.src) dataUrl = img.src;
        } catch (e) { dataUrl = (img && img.src) || ''; }
        document.body.removeChild(holder);
        resolve(dataUrl);
      }, 60);
    });
  }

  var QR = {
    whatsappUrl: function (digits) {
      var d = (digits || '').replace(/\D/g, '');
      return d ? 'https://wa.me/' + d : '';
    },
    instagramUrl: function (handle) {
      var h = (handle || '').replace(/^@/, '').trim();
      return h ? 'https://instagram.com/' + h : '';
    },
    toDataUrl: buildQrDataUrl
  };

  global.QR = QR;
})(window);
