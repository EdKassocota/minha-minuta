// Funções utilitárias para processamento inteligente de campos

export function numberToWords(n, currency = null) {
  if (n === 0) return 'zero';

  const unities = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const tens1 = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove'];
  const tens2 = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  function convertGroup(num) {
    if (num === 0) return '';
    if (num === 100) return 'cem';
    
    let res = [];
    const c = Math.floor(num / 100);
    const d = Math.floor((num % 100) / 10);
    const u = num % 10;

    if (c > 0) res.push(hundreds[c]);
    
    if (d === 1) {
      if (res.length > 0) res.push('e');
      res.push(tens1[u]);
    } else {
      if (d > 1) {
        if (res.length > 0) res.push('e');
        res.push(tens2[d]);
      }
      if (u > 0) {
        if (res.length > 0) res.push('e');
        res.push(unities[u]);
      }
    }
    return res.join(' ');
  }

  let words = [];
  
  if (n >= 1000000) {
    const milhoes = Math.floor(n / 1000000);
    if (milhoes === 1) {
      words.push('um milhão');
    } else {
      words.push(convertGroup(milhoes) + ' milhões');
    }
    n = n % 1000000;
    if (n > 0 && n <= 100) words.push('e');
  }

  if (n >= 1000) {
    const milhares = Math.floor(n / 1000);
    if (milhares === 1) {
      words.push('mil');
    } else {
      words.push(convertGroup(milhares) + ' mil');
    }
    n = n % 1000;
    if (n > 0 && n <= 100) words.push('e');
  }

  if (n > 0) {
    words.push(convertGroup(n));
  }

  let result = words.join(' ').trim();
  
  if (currency === 'AOA') {
    return result + (result === 'um' ? ' kwanza' : ' kwanzas');
  } else if (currency === 'USD') {
    return result + (result === 'um' ? ' dólar americano' : ' dólares americanos');
  }
  
  return result;
}

export function dateToExtensoPT(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return dateStr;

  const months = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  if (month < 1 || month > 12) return dateStr;

  return `${day} de ${months[month]} de ${year}`;
}

export function applyGenderConcordance(html, gender) {
  if (!html) return html;
  
  let result = html;
  
  const rules = [
    { regex: /\b(o\/a|a\/o)\b/gi, replacement: gender === 'M' ? 'o' : 'a' },
    { regex: /\b(do\/da|da\/do)\b/gi, replacement: gender === 'M' ? 'do' : 'da' },
    { regex: /\b(ao\/à|à\/ao)\b/gi, replacement: gender === 'M' ? 'ao' : 'à' },
    { regex: /\b(pelo\/pela|pela\/pelo)\b/gi, replacement: gender === 'M' ? 'pelo' : 'pela' },
    { regex: /\b(no\/na|na\/no)\b/gi, replacement: gender === 'M' ? 'no' : 'na' },
    { regex: /\b(Senhor\(a\)|Senhor\/a)\b/gi, replacement: gender === 'M' ? 'Senhor' : 'Senhora' },
    { regex: /\b(Sr\.\(a\)|Sr\.\/a)\b/gi, replacement: gender === 'M' ? 'Sr.' : 'Sra.' },
    { regex: /\b\(o\/a\)\b/gi, replacement: gender === 'M' ? '(o)' : '(a)' },
    { regex: /\b(contratado\/contratada|contratada\/contratado)\b/gi, replacement: gender === 'M' ? 'contratado' : 'contratada' },
    { regex: /\b(trabalhador\/trabalhadora|trabalhadora\/trabalhador)\b/gi, replacement: gender === 'M' ? 'trabalhador' : 'trabalhadora' }
  ];

  rules.forEach(rule => {
    result = result.replace(rule.regex, rule.replacement);
  });

  return result;
}

export function capitalizeName(name) {
  if (!name) return '';
  const lowercaseWords = ['de', 'da', 'do', 'dos', 'das', 'e', 'a', 'o'];
  
  return name.toLowerCase().split(' ').map((word, index) => {
    if (index > 0 && lowercaseWords.includes(word)) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

export function validateBI(bi) {
  // Padrão de BI angolano: 9 dígitos + 2 letras + 3 dígitos (total 14)
  // Ou flexível para este caso.
  if (!bi) return false;
  const regex = /^\d{9}[A-Z]{2}\d{3}$/i;
  return regex.test(bi.replace(/\s/g, ''));
}

export function validateNIF(nif) {
  if (!nif) return false;
  const cleanNif = nif.replace(/\s/g, '');
  return /^\d{9,10}$/.test(cleanNif);
}
