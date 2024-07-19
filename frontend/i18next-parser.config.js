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
  
    output: './public/locales/$LOCALE/$NAMESPACE.json',
  
    pluralSeparator: '_',
  
    input: './public/locales/**/translation.json',
  
    verbose: true,
  
    resetDefaultValueLocale: null,
  
    i18nextOptions: null,
  
    yamlOptions: null,
  }