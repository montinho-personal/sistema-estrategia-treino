/**
 * brand.js — Formulário de Identidade Visual.
 * Renderiza os campos, lê/grava no Store e aplica as cores em tempo real.
 */
(function (global) {
  'use strict';

  function field(label, name, value, type, attrs) {
    type = type || 'text';
    var extra = attrs || '';
    return (
      '<label class="field">' +
        '<span class="field__label">' + label + '</span>' +
        '<input class="field__input" type="' + type + '" name="' + name + '" ' +
          'value="' + escapeAttr(value || '') + '" ' + extra + ' />' +
      '</label>'
    );
  }

  function colorField(label, name, value) {
    return (
      '<label class="field field--color">' +
        '<span class="field__label">' + label + '</span>' +
        '<span class="color-input">' +
          '<input type="color" name="' + name + '" value="' + (value || '#000000') + '" />' +
          '<input type="text" class="color-input__hex" data-hex-for="' + name + '" value="' + (value || '') + '" />' +
        '</span>' +
      '</label>'
    );
  }

  function imageField(label, name, value) {
    return (
      '<label class="field field--image">' +
        '<span class="field__label">' + label + '</span>' +
        '<span class="image-input">' +
          '<input type="file" accept="image/*" data-image-for="' + name + '" />' +
          '<span class="image-input__preview ' + (value ? 'has-image' : '') + '" data-preview-for="' + name + '">' +
            (value ? '<img src="' + value + '" alt="" />' : 'Nenhuma imagem') +
          '</span>' +
          (value ? '<button type="button" class="image-input__clear" data-clear-for="' + name + '">Remover</button>' : '') +
        '</span>' +
      '</label>'
    );
  }

  function checkField(label, name, checked) {
    return (
      '<label class="field field--check">' +
        '<input type="checkbox" name="' + name + '" ' + (checked ? 'checked' : '') + ' />' +
        '<span>' + label + '</span>' +
      '</label>'
    );
  }

  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function render(form, brand) {
    form.innerHTML =
      section('Marca', [
        field('Nome da empresa', 'empresa', brand.empresa),
        field('Nome do Personal', 'personal', brand.personal),
        field('CREF', 'cref', brand.cref),
        field('Slogan / assinatura de marca', 'slogan', brand.slogan),
        imageField('Logo', 'logoDataUrl', brand.logoDataUrl)
      ]) +
      section('Contato e redes', [
        field('Telefone', 'telefone', brand.telefone),
        field('WhatsApp (com DDI, só números)', 'whatsapp', brand.whatsapp, 'text', 'placeholder="5511900000000"'),
        field('Instagram (@handle)', 'instagram', brand.instagram),
        field('Site', 'site', brand.site),
        field('E-mail', 'email', brand.email, 'email'),
        field('Endereço', 'endereco', brand.endereco)
      ]) +
      section('Cores da identidade', [
        colorField('Cor primária', 'corPrimaria', brand.corPrimaria),
        colorField('Cor secundária (destaque)', 'corSecundaria', brand.corSecundaria),
        colorField('Cor de fundo da capa', 'corFundo', brand.corFundo),
        colorField('Cor do texto', 'corTexto', brand.corTexto)
      ]) +
      section('Tipografia', [
        selectField('Fonte dos títulos', 'fonteTitulo', brand.fonteTitulo, ['Sora', 'Inter', 'Georgia', 'Poppins']),
        selectField('Fonte do texto', 'fonteTexto', brand.fonteTexto, ['Inter', 'Sora', 'Georgia', 'Arial'])
      ]) +
      section('Rodapé, assinatura e QR Codes', [
        field('Texto do rodapé', 'rodape', brand.rodape),
        imageField('Assinatura digital (imagem)', 'assinatura', brand.assinatura),
        checkField('Exibir assinatura no documento', 'mostrarAssinatura', brand.mostrarAssinatura),
        checkField('Exibir QR Code do WhatsApp', 'mostrarQrWhatsapp', brand.mostrarQrWhatsapp),
        checkField('Exibir QR Code do Instagram', 'mostrarQrInstagram', brand.mostrarQrInstagram)
      ]);
  }

  function selectField(label, name, value, options) {
    var opts = options.map(function (o) {
      return '<option value="' + o + '"' + (o === value ? ' selected' : '') + '>' + o + '</option>';
    }).join('');
    return (
      '<label class="field">' +
        '<span class="field__label">' + label + '</span>' +
        '<select class="field__input" name="' + name + '">' + opts + '</select>' +
      '</label>'
    );
  }

  function section(title, fields) {
    return (
      '<fieldset class="form__section">' +
        '<legend>' + title + '</legend>' +
        '<div class="form__grid">' + fields.join('') + '</div>' +
      '</fieldset>'
    );
  }

  function collect(form, current) {
    var data = Store.clone(current);
    var inputs = form.querySelectorAll('input, select');
    inputs.forEach(function (el) {
      if (!el.name) return;
      if (el.type === 'checkbox') data[el.name] = el.checked;
      else if (el.type === 'file') { /* tratado à parte */ }
      else data[el.name] = el.value;
    });
    return data;
  }

  global.BrandForm = {
    render: render,
    collect: collect
  };
})(window);
