/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/bootstrap-cookie-consent-settings
 * License: MIT, see file 'LICENSE'
 */

"use strict"

function BootstrapCookieConsentSettings(props) {

    const self = this
    let detailedSettingsShown = false
    this.props = {
        privacyPolicyUrl: undefined, // the URL of your privacy policy page
        legalNoticeUrl: undefined, // the URL of you legal notice page (Impressum)
        contentURL: "/cookie-consent-content", // this folder must contain the language-files in the needed languages (`[lang].js`)
        buttonAgreeClass: "btn btn-primary", // the "Agree to all" buttons class
        buttonDontAgreeClass: "btn btn-link text-decoration-none", // the "I do not agree" buttons class
        buttonSaveClass: "btn btn-secondary", // the "Save selection" buttons class
        autoShowModal: true, // disable autoShowModal on the privacy policy and legal notice pages, to make these pages readable
        postSelectionCallback: undefined, // callback function, called after the user has saved the settings
        lang: navigator.language, // the language, in which the modal is shown
        defaultLang: "en", // default language, if `lang` is not available as translation in `cookie-consent-content`
        categories: ["necessary", "statistics", "marketing", "personalization"], // the categories for selection, must be contained in the language files
        cookieName: "cookie-consent-settings",  // the name of the cookie in which the configuration is stored as JSON
        cookieStorageDays: 365, // the duration the cookie configuration is stored on the client
        modalId: "bootstrapCookieConsentSettingsModal" // the id of the modal dialog element
    }
    if(!props.privacyPolicyUrl) {
        console.error("please set `privacyPolicyUrl` in the props of BootstrapCookieConsentSettings")
    }
    if(!props.legalNoticeUrl) {
        console.error("please set `legalNoticeUrl` in the props of BootstrapCookieConsentSettings")
    }
    for (const property in props) {
        // noinspection JSUnfilteredForInLoop
        this.props[property] = props[property]
    }
    this.lang = this.props.lang
    if (this.lang.indexOf("-") !== -1) {
        this.lang = this.lang.split("-")[0]
    }

    // read the cookie, and if its content don't fits the categories, remove it
    const cookie = getCookie(this.props.cookieName)
    if(cookie) {
        const cookieContent = JSON.parse(cookie)
        for (const category of this.props.categories) {
            if(cookieContent[category] === undefined) {
                console.log("cookie settings changed, removing settings cookie")
                removeCookie(this.props.cookieName)
                break
            }
        }
    }

    fetchContent(self.lang, (result) => {
        self.content = JSON.parse(result)
        renderModal()
    })

    function renderModal() {
        const _t = self.content
        const linkPrivacyPolicy = '<a href="' + self.props.privacyPolicyUrl + '">' + _t.privacyPolicy + '</a>'
        const linkLegalNotice = '<a href="' + self.props.legalNoticeUrl + '">' + _t.legalNotice + '</a>'
        if (self.content[self.lang] === undefined) {
            self.lang = self.props.defaultLang
        }
        self.content.body = self.content.body.replace(/--privacy-policy--/, linkPrivacyPolicy)
        let optionsHtml = ""
        for (const category of self.props.categories) {
            const categoryContent = self.content.categories[category]
            if(!categoryContent) {
                console.error("no content for category", category, "found in language file", self.lang)
            }
            let descriptionList = ""
            for (const descriptionElement of categoryContent.description) {
                descriptionList += `<li>${descriptionElement}</li>`
            }
            optionsHtml += `<div class="bccs-option" data-name="${category}">
                    <div class="form-check mb-1">
                        <input type="checkbox" class="form-check-input" id="bccs-checkbox-${category}">
                        <label class="form-check-label" for="bccs-checkbox-${category}"><b>${categoryContent.title}</b></label>
                    </div>
                    <ul>
                        ${descriptionList}
                    </ul>
                </div>`
        }
        self.modalContent = `<!-- cookie banner => https://github.com/shaack/bootstrap-cookie-consent-settings -->
<div class="modal-dialog modal-lg shadow" role="document">
    <div class="modal-content">
        <div class="modal-header">
            <h4 class="modal-title">${self.content.title}</h4>
        </div>
        <div class="modal-body">
            <div class="bccs-body-text" style="font-size: 80%">
                <p>${self.content.body}</p>
            </div>
            <p class="d-flex justify-content-between">
                ${linkLegalNotice}
                <a href="#bccs-options" data-bs-toggle="collapse">Meine Einstellungen</a>
            </p>
            <div id="bccs-options" class="collapse">
                ${optionsHtml}
            </div>
        </div>
        <div class="modal-footer">
            <button id="bccs-buttonDoNotAgree" type="button"
                    class="${self.props.buttonDontAgreeClass}">
                ${self.content.buttonNotAgree}
            </button>
            <button id="bccs-buttonAgree" type="button" class="${self.props.buttonAgreeClass}">${self.content.buttonAgree}</button>
            <button id="bccs-buttonSave" type="button" class="${self.props.buttonSaveClass}">
                ${self.content.buttonSaveSelection}
            </button>
            <button id="bccs-buttonAgreeAll" type="button" class="${self.props.buttonAgreeClass}">${self.content.buttonAgreeAll}</button>
        </div>
    </div>
</div>`
        if (getCookie(self.props.cookieName) === undefined && self.props.autoShowModal) {
            showDialog()
        }
    }

    function showDialog() {
        documentReady(function () {
            self.modal = document.getElementById(self.props.modalId)
            if (!self.modal) {
                self.modal = document.createElement("div")
                self.modal.id = self.props.modalId
                self.modal.setAttribute("class", "modal fade")
                self.modal.setAttribute("tabindex", "-1")
                self.modal.setAttribute("role", "dialog")
                self.modal.setAttribute("aria-labelledby", self.props.modalId)
                self.modal.innerHTML = self.modalContent
                document.body.append(self.modal)
                self.$modal = $(self.modal)
                if (self.props.postSelectionCallback) {
                    self.$modal.on("hidden.bs.modal", function () {
                        self.props.postSelectionCallback()
                    })
                }
                self.$modal.modal({
                    backdrop: "static",
                    keyboard: false
                })

                self.$modal.modal("show")
                self.$buttonDoNotAgree = $("#bccs-buttonDoNotAgree")
                self.$buttonAgree = $("#bccs-buttonAgree")
                self.$buttonSave = $("#bccs-buttonSave")
                self.$buttonAgreeAll = $("#bccs-buttonAgreeAll")
                updateButtons()
                updateOptionsFromCookie()
                $("#bccs-options").on("hide.bs.collapse", function () {
                    detailedSettingsShown = false
                    updateButtons()
                }).on("show.bs.collapse", function () {
                    detailedSettingsShown = true
                    updateButtons()
                })
                self.$buttonDoNotAgree.click(function () {
                    doNotAgree()
                })
                self.$buttonAgree.click(function () {
                    agreeAll()
                })
                self.$buttonSave.click(function () {
                    saveSettings()
                })
                self.$buttonAgreeAll.click(function () {
                    agreeAll()
                })
            } else {
                self.$modal.modal("show")
            }
        }.bind(this))
    }

    function updateOptionsFromCookie() {
        const settings = self.getSettings()
        if (settings) {
            for (let setting in settings) {
                const $checkbox = self.$modal.find("#bccs-options .bccs-option[data-name='" + setting + "'] input[type='checkbox']")
                $checkbox.prop("checked", settings[setting])
            }
        }
        const $checkboxNecessary = self.$modal.find("#bccs-options .bccs-option[data-name='necessary'] input[type='checkbox']")
        $checkboxNecessary.prop("checked", true)
        $checkboxNecessary.prop("disabled", true)
    }

    function updateButtons() {
        if (detailedSettingsShown) {
            self.$buttonDoNotAgree.hide()
            self.$buttonAgree.hide()
            self.$buttonSave.show()
            self.$buttonAgreeAll.show()
        } else {
            self.$buttonDoNotAgree.show()
            self.$buttonAgree.show()
            self.$buttonSave.hide()
            self.$buttonAgreeAll.hide()
        }
    }

    function gatherOptions(setAllExceptNecessary) {
        const $options = self.$modal.find("#bccs-options .bccs-option")
        const options = {}
        for (let i = 0; i < $options.length; i++) {
            const option = $options[i]
            const name = option.getAttribute("data-name")
            if (name === "necessary") {
                options[name] = true
            } else if (setAllExceptNecessary === undefined) {
                const $checkbox = $(option).find("input[type='checkbox']")
                options[name] = $checkbox.prop("checked")
            } else {
                options[name] = !!setAllExceptNecessary
            }
        }
        return options
    }

    function agreeAll() {
        setCookie(self.props.cookieName, JSON.stringify(gatherOptions(true)), self.props.cookieStorageDays)
        self.$modal.modal("hide")
    }

    function doNotAgree() {
        setCookie(self.props.cookieName, JSON.stringify(gatherOptions(false)), self.props.cookieStorageDays)
        self.$modal.modal("hide")
    }

    function saveSettings() {
        setCookie(self.props.cookieName, JSON.stringify(gatherOptions()), self.props.cookieStorageDays)
        self.$modal.modal("hide")
    }

    function fetchContent(lang, callback) {
        const request = new XMLHttpRequest()
        request.overrideMimeType("application/json")
        const url = self.props.contentURL + '/' + lang + '.json'
        request.open('GET', url, true)
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                if (request.status === 200) {
                    callback(request.responseText)
                } else {
                    console.error(url, request.status)
                }
            }
        }
        request.onloadend = function() {
            if (request.status === 404 && lang !== self.props.defaultLang) {
                console.warn("language " + lang + " not found trying defaultLang " + self.props.defaultLang)
                fetchContent(self.props.defaultLang, callback)
            }
        }
        request.send(null)
    }

    function setCookie(name, value, days) {
        let expires = ""
        if (days) {
            const date = new Date()
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
            expires = "; expires=" + date.toUTCString()
        }
        document.cookie = name + "=" + (value || "") + expires + "; Path=/; SameSite=Strict;"
    }

    function getCookie(name) {
        const nameEQ = name + "="
        const ca = document.cookie.split(';')
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i]
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length)
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length)
            }
        }
        return undefined
    }

    function removeCookie(name) {
        document.cookie = name + '=; Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    }

    function documentReady(fn) {
        if (document.readyState !== 'loading') {
            fn()
        } else {
            document.addEventListener('DOMContentLoaded', fn)
        }
    }

    // API

    this.showDialog = function () {
        showDialog()
    }
    this.getSettings = function (optionName) {
        const cookie = getCookie(self.props.cookieName)
        if (cookie) {
            const settings = JSON.parse(cookie)
            if (optionName === undefined) {
                return settings
            } else {
                if (settings) {
                    return settings[optionName]
                } else {
                    return false
                }
            }
        } else {
            return undefined
        }
    }
}
