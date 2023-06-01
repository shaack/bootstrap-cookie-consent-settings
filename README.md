# bootstrap-cookie-consent-settings

A modal dialog (cookie banner) and framework to handle the EU law (as written by EuGH, 1.10.2019 – C-673/17)
about cookies in a website. Needs Bootstrap 5.

- [Demo page](https://shaack.com/projekte/bootstrap-cookie-consent-settings)
- [GitHub Repository](https://github.com/shaack/bootstrap-cookie-consent-settings)
- [npm package](https://www.npmjs.com/package/bootstrap-cookie-consent-settings)

## Usage

### Construct

Initialize the cookie consent framework with the constructor

```js
var cookieSettings = new BootstrapCookieConsentSettings(props)
```

You should configure the framework with the `props` object, at least the properties `privacyPolicyUrl`, `legalNoticeUrl`
and `contentURL`. The default configuration is

```js
this.props = {
    privacyPolicyUrl: undefined, // the URL of your privacy policy page
    legalNoticeUrl: undefined, // the URL of you legal notice page (Impressum)
    contentURL: "/cookie-consent-content", // this folder must contain the language-files in the needed languages (`[lang].js`)
    buttonAgreeClass: "btn btn-primary", // the "Agree to all" buttons class
    buttonDontAgreeClass: "btn btn-link text-decoration-none", // the "I do not agree" buttons class
    buttonSaveClass: "btn btn-secondary", // the "Save selection" buttons class
    autoShowModal: true, // disable autoShowModal on the privacy policy and legal notice pages, to make these pages readable
    alsoUseLocalStorage: true, // if true, the settings are stored in localStorage, too
    postSelectionCallback: undefined, // callback function, called after the user has saved the settings
    lang: navigator.language, // the language, in which the modal is shown
    defaultLang: "en", // default language, if `lang` is not available as translation in `cookie-consent-content`
    categories: ["necessary", "statistics", "marketing", "personalization"], // the categories for selection, must be contained in the language files
    cookieName: "cookie-consent-settings",  // the name of the cookie in which the configuration is stored as JSON
    cookieStorageDays: 365, // the duration the cookie configuration is stored on the client
    modalId: "bootstrapCookieConsentSettingsModal" // the id of the modal dialog element
}
```

### Show dialog

On a new visit the dialog is shown automatically. 

To allow the user a reconfiguration you can show the Dialog again with

```js
cookieSettings.showDialog()
```

### Read the settings in JavaScript

Read all cookie settings with

```js 
cookieSettings.getSettings()
```

It should return some JSON like

```json
{
  "necessary": true,
  "statistics": true,
  "marketing": true,
  "personalization": true
}
```

or `undefined`, before the user has chosen his cookie options.

Read a specific cookie setting with

```js
cookieSettings.getSettings('statistics')
```

for the `statistics` cookie settings. Also returns `undefined`, before the user has chosen his cookie options.

### Read the settings from the backend

You can read the settings with all server languages, you just have to read the cookie `cookie-consent-settings`. 
The content of the cookie is encoded like a http query string. 

``` 
necessary=true&statistics=false&marketing=true&personalization=true
```

#### PHP helper class

I provide a PHP helper class that you can use to read and write the settings from a PHP backend.

It is located in `php/Shaack/BootstrapCookieConsentSettings.php`. 

You can use it as described in the following example.

```PHP
$cookieSettings = new \Shaack\BootstrapCookieConsentSettings();
// read all settings
$allSettings = $cookieSettings->getSettings();
// read a specific setting
$statisticsAllowed = $cookieSettings->getSetting("statistics");
// write a specific setting
$cookieSettings->setSetting("statistics", false);
```

### Internationalization

You find the language files in `./cookie-consent-content`. You can add here language files or modify the existing. If
you add language files please consider a pull request to also add them in this repository. Thanks.

## Disclaimer

You can use this banner for your website free of charge under the [MIT-License](./LICENSE).

The banner and framework was designed in cooperation with data protection officers and lawyers. However, we can not
guarantee whether the banner is correct for your website and assume no liability for its use.

bootstrap-cookie-consent-settings is a project of [shaack.com](https://shaack.com).
