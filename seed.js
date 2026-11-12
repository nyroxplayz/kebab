'use strict';
// Carta inicial. El dueño puede cambiar TODO desde el panel (/admin).
// Flags: m = elegir carne, x = extra carne/queso, s = elegir salsa, d = elegir bebida
const slugify = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'item';

const RAW = [
  ['Menús', [
    ['Menú Kebab', 'Kebab + patatas + bebida', 8, 'mxsd'],
    ['Menú Dürum', 'Dürum + patatas + bebida', 9, 'mxsd'],
    ['Menú Plato G', 'Plato kebab grande + patatas + bebida + pan', 9.5, 'mxsd'],
    ['Menú Lahmacum', 'Lahmacum kebab + patatas + bebida', 10, 'mxsd'],
    ['Menú Alitas', '6 alitas + patatas + bebida', 8, 'sd'],
    ['Menú Nuggets', '8 nuggets + patatas + bebida', 6.9, 'sd'],
    ['Menú Pops Pollo', '20 pops de pollo + patatas + bebida', 6.9, 'sd'],
    ['Menú Burrito Pollo', 'Burrito de pollo + patatas + bebida', 9.5, 'sd'],
    ['Menú Tiras de Pollo', '4 tiras de pollo + patatas + bebida', 6.9, 'sd'],
    ['Oferta Dürum 2 Personas', '2 dürum + 2 patatas + 2 bebidas', 17, 'mxs'],
    ['Oferta Plato 2 Personas', 'Plato kebab + patatas + 2 bebidas + pan', 16, 'mxs'],
    ['Menú Hamburguesa de Pollo', 'Hamburguesa de pollo + patatas + bebida', 6.9, 'sd'],
    ['Menú Taco Francés', 'Taco francés + patatas + bebida', 9.5, 'mxsd'],
    ['Oferta Martes · 2 Kebab', 'Solo martes: 2 kebab + bebida', 9.5, 'ms'],
    ['Oferta Martes · 2 Dürum', 'Solo martes: 2 dürum + bebida', 11.5, 'ms'],
    ['Oferta Miércoles', 'Solo miércoles: 2 pizzas medianas + bebida 2L', 16, ''],
  ]],
  ['Pollo Frito Broaster', [
    ['Pollo Frito Broaster · 3 piezas', '3 piezas + patatas + bebida (lata)', 8, 's'],
    ['Pollo Frito Broaster · 6 piezas', '6 piezas + patatas + 2 bebidas (lata)', 14.5, 's'],
    ['Pollo Frito Broaster · 10 piezas', '10 piezas + patatas + ensalada + bebida 2L', 23.5, 's'],
  ]],
  ['Comida sin menú', [
    ['Kebab', 'De ternera, pollo o mixto con lechuga, tomate, cebolla, maíz y salsa', 4.9, 'mxs'],
    ['Kebab Solo Carne', 'Solo carne', 5.9, 'mxs'],
    ['Dürum', 'De ternera, pollo o mixto con lechuga, tomate, cebolla, maíz y salsa', 5.9, 'mxs'],
    ['Dürum Solo Carne', 'Solo carne', 6.9, 'mxs'],
    ['Lahmacum Kebab', 'De ternera, pollo o mixto con lechuga, tomate, cebolla, maíz y salsa', 6.5, 'mxs'],
    ['Lahmacum Kebab Solo Carne', 'Solo carne', 7.5, 'mxs'],
    ['Hamburguesa de Pollo', 'Con lechuga, tomate, cebolla, maíz y salsa', 4.7, 's'],
    ['Burrito de Pollo', 'Con lechuga, tomate, cebolla, maíz y salsa', 6.5, 's'],
  ]],
  ['Pizzas', [
    ['Pizza Margarita', 'Tomate y queso', [['33cm', 9], ['40cm', 14]], ''],
    ['Pizza Tres Quesos', 'Tomate y tres quesos', [['33cm', 9], ['40cm', 14]], ''],
    ['Pizza King Especial', 'Carne de kebab, cebolla, queso, champiñones, maíz y pimientos rojo y verde', [['33cm', 10], ['40cm', 15]], ''],
    ['Pizza Riojana', 'Pollo, queso, pimientos rojo y verde', [['33cm', 9], ['40cm', 14]], ''],
    ['Pizza de Atún', 'Atún, cebolla y queso', [['33cm', 9], ['40cm', 14]], ''],
    ['Pizza Vegetal', 'Champiñones, cebolla, maíz, tomate, queso y pimientos', [['33cm', 9], ['40cm', 14]], ''],
    ['Pizza de Kebab', 'Queso y carne de kebab', [['33cm', 9], ['40cm', 14]], ''],
  ]],
  ['Platos Kebab', [
    ['Plato Kebab Familiar', 'De pollo, ternera o mixto. Con ensalada, patatas fritas, salsa y 2 panes', 13, 'mxs'],
    ['Plato Kebab Grande', 'De pollo, ternera o mixto. Con ensalada, patatas fritas o arroz, salsa y pan', 8.5, 'mxs'],
    ['Plato Kebab Mediano', 'De pollo, ternera o mixto. Con ensalada, patatas fritas, salsa y pan', 7.5, 'mxs'],
  ]],
  ['Pedratas', [
    ['Pedrata', 'Carne con patatas y salsa. Haz tu pedrata o dürüm gratinado por solo 1,50€', [['Pequeña', 4.5], ['Mediana', 8.5], ['Grande', 9.5], ['Familiar', 15]], 'mxs'],
    ['Plato Solo Carne', 'Solo carne', [['Pequeño', 5.5], ['Mediano', 11], ['Grande', 13], ['Familiar', 21]], 'ms'],
  ]],
  ['Pollo Asado', [
    ['Pollo Asado con patatas y salsa', 'Pollo asado entero', 9, 's'],
    ['Pollo Asado con patatas y ensalada', 'Pollo asado entero', 10, 's'],
    ['Medio Pollo Asado', 'Con patatas y ensalada', 6, 's'],
  ]],
  ['Raciones', [
    ['Alitas x6', 'Alitas de pollo crujientes', 6, 's'],
    ['Nuggets x8', 'Nuggets de pollo', 5, 's'],
    ['Samosa Vegetal y Carne', '1 unidad', 1, ''],
    ['Aros de Cebolla x10', 'Crujientes', 3, 's'],
    ['Popcorn de Pollo x16', 'Bocaditos de pollo', 4, 's'],
  ]],
  ['Taco Francés', [
    ['Taco Francés de Carne', 'Ternera, pollo o mixto. Con patatas, salsa y queso mozzarella', 6.5, 'ms'],
    ['Taco Francés de Tiras de Pollo', 'Con patatas, salsa y queso mozzarella', 6.5, 's'],
    ['Taco Francés de Nuggets', 'Con patatas, salsa y queso mozzarella', 6.5, 's'],
    ['Taco Francés de Falafel', 'Con patatas, salsa y queso mozzarella', 6.5, 's'],
  ]],
  ['Patatas', [
    ['Patatas Fritas', 'Clásicas', 3, 's'],
    ['Patatas Deluxe', 'Gajos especiados', 3.5, 's'],
    ['Patatas Bravas', 'Con salsa brava', 3.5, ''],
    ['Patatas Gratinadas', 'Con queso fundido', 4.5, ''],
  ]],
  ['Ensaladas', [
    ['Ensalada Especial', 'Lechuga, tomate, cebolla, aceitunas, maíz y trozos de pollo', 4, ''],
    ['Ensalada Verde', 'Lechuga, tomate, cebolla, aceitunas, maíz y zanahoria', 3, ''],
    ['Ensalada King', 'Lechuga, tomate, cebolla, aceitunas, maíz, zanahoria, atún y trozos de pollo', 4.5, ''],
  ]],
  ['Bebidas', [
    ['Lata (33cl)', 'Coca-Cola, Fanta, Sprite…', 1.6, 'd'],
    ['Agua 50cl', '', 1, ''],
    ['Agua 1,5L', '', 1.5, ''],
    ['Refresco 2L', 'Para compartir', 3, 'd'],
  ]],
];

const IMG = {"menu-kebab": "kebab", "menu-durum": "durum", "menu-plato-g": "plato", "menu-lahmacum": "lahmacum", "menu-alitas": "alitas", "menu-nuggets": "nuggets", "menu-pops-pollo": "pops", "menu-burrito-pollo": "burrito", "menu-tiras-de-pollo": "tiras", "menu-hamburguesa-de-pollo": "hamburguesa", "menu-taco-frances": "taco", "oferta-durum-2-personas": "durum", "oferta-plato-2-personas": "plato", "oferta-martes-2-kebab": "kebab", "oferta-martes-2-durum": "durum", "oferta-miercoles": "pizza-queso", "pollo-frito-broaster-3-piezas": "broaster3", "pollo-frito-broaster-6-piezas": "broaster6", "pollo-frito-broaster-10-piezas": "broaster10", "kebab": "kebab", "kebab-solo-carne": "carne", "durum": "durum-salsa", "durum-solo-carne": "carne", "lahmacum-kebab": "lahmacum", "lahmacum-kebab-solo-carne": "lahmacum", "hamburguesa-de-pollo": "hamburguesa", "burrito-de-pollo": "burrito", "pizza-margarita": "pizza-queso", "pizza-tres-quesos": "pizza-queso", "pizza-king-especial": "pizza-tabla", "pizza-riojana": "pizza-especial", "pizza-de-atun": "pizza-especial", "pizza-vegetal": "pizza-especial", "pizza-de-kebab": "pizza-tabla", "plato-kebab-familiar": "plato", "plato-kebab-grande": "plato", "plato-kebab-mediano": "plato", "pedrata": "pedrata", "plato-solo-carne": "carne", "pollo-asado-con-patatas-y-salsa": "pollo-asado", "pollo-asado-con-patatas-y-ensalada": "pollo-asado", "medio-pollo-asado": "pollo-asado", "alitas-x6": "alitas", "nuggets-x8": "nuggets", "samosa-vegetal-y-carne": "samosa", "aros-de-cebolla-x10": "aros", "popcorn-de-pollo-x16": "pops", "taco-frances-de-carne": "taco", "taco-frances-de-tiras-de-pollo": "taco", "taco-frances-de-nuggets": "taco", "taco-frances-de-falafel": "taco", "patatas-fritas": "patatas", "patatas-deluxe": "patatas-gajo", "patatas-bravas": "patatas-gajo", "patatas-gratinadas": "patatas-gratin", "ensalada-especial": "ensalada", "ensalada-verde": "ensalada", "ensalada-king": "ensalada", "lata-33cl": "lata", "agua-50cl": "agua", "agua-1-5l": "agua-grande", "refresco-2l": "refresco"};

function buildSeed() {
  const used = new Set();
  const uid = n => { let b = slugify(n), i = b, k = 2; while (used.has(i)) i = b + '-' + k++; used.add(i); return i; };
  const cats = RAW.map(([name, items]) => ({
    id: slugify(name),
    name,
    items: items.map(([n, d, p, f]) => {
      const it = {
        id: uid(n), name: n, desc: d, available: true, img: IMG[slugify(n)] ? '/img/' + IMG[slugify(n)] + '.webp' : null,
        opts: { meat: f.includes('m'), extra: f.includes('x'), sauce: f.includes('s'), drink: f.includes('d') },
      };
      if (Array.isArray(p)) it.sizes = p.map(([label, price]) => ({ label, price })); else it.price = p;
      return it;
    }),
  }));
  return {
    v: 1,
    settings: {
      name: 'King Kebab Turkish Food',
      phone: '941 10 40 16',
      address: 'Plaza del Parque 1, 26140 Lardero (La Rioja)',
      tz: 'Europe/Madrid',
      accepting: true,
      banner: '',
      extraPrice: 1,
      meats: ['Pollo', 'Ternera', 'Mixto'],
      sauces: ['Salsa Blanca', 'Picante', 'Sin Salsa'],
      drinks: ['Coca-Cola', 'Coca-Cola Zero', 'Fanta Naranja', 'Fanta Limón', 'Agua'],
      payments: ['Efectivo', 'Tarjeta (datáfono)', 'Bizum'],
      autoApproveReviews: false,
      // 0 = domingo ... 6 = sábado
      hours: {
        0: '13:00-24:00', 1: '13:00-16:00, 18:30-24:00', 2: '13:00-16:00, 18:30-24:00',
        3: '13:00-16:00, 18:30-24:00', 4: '13:00-16:00, 18:30-24:00', 5: '13:00-24:00', 6: '13:00-24:00',
      },
    },
    zones: [
      { id: 'lardero', name: 'Lardero', fee: 1, min: 7, active: true },
      { id: 'villa-patro', name: 'Villa Patro', fee: 1.5, min: 7, active: true },
      { id: 'alberite', name: 'Alberite', fee: 2, min: 10, active: true },
      { id: 'villamediana', name: 'Villamediana', fee: 2, min: 10, active: true },
      { id: 'entrena', name: 'Entrena', fee: 5, min: 20, active: true },
      { id: 'albelda', name: 'Albelda', fee: 5, min: 20, active: true },
    ],
    cats,
    orders: [],
    reviews: [],
    counter: 0,
    auth: {},
  };
}
module.exports = { buildSeed, slugify };
