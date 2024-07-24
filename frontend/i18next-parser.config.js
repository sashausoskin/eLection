export default {
    contextSeparator: '_',
  
    createOldCatalogs: true,
  
    defaultNamespace: 'translation',
  
    defaultValue: null,
  
    indentation: 2,
  
    keepRemoved: false,
  
    keySeparator: '.',
    
    lexers: {
      hbs: ['HandlebarsLexer'],
      handlebars: ['HandlebarsLexer'],
  
      htm: ['HTMLLexer'],
      html: ['HTMLLexer'],
  
      mjs: ['JavascriptLexer'],
      js: ['JavascriptLexer'],
      ts: ['JavascriptLexer'],
      jsx: ['JsxLexer'],
      tsx: ['JsxLexer'],
  
      default: ['JavascriptLexer'],
    },
  
    lineEnding: 'auto',
  
    locales: ['en', 'fi'],

    namespaceSeparator: ':',
  
    output: './public/locales/$NAMESPACE/$LOCALE.json',
  
    pluralSeparator: '_',
  
    input: './public/locales/$NAMESPACE/$LOCALE.json',
  
    verbose: true,
  
    resetDefaultValueLocale: null,
  
    i18nextOptions: null,
  
    yamlOptions: null,
  }