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
        alsoUseLocalStorage: true, // if true, the settings are stored in localStorage, too
        postSelectionCallback: undefined, // callback function, called after the user has saved the settings
        lang: navigator.language, // the language, in which the modal is shown
        defaultLang: "en", // default language, if `lang` is not available as translation in `cookie-consent-content`
        categories: ["necessary", "statistics", "marketing", "personalization"], // the categories for selection, must be contained in the language files
        cookieName: "cookie-consent-settings",  // the name of the cookie in which the configuration is stored as JSON
        cookieStorageDays: 365, // the duration the cookie configuration is stored on the client
        modalId: "bootstrapCookieConsentSettingsModal" // the id of the modal dialog element
    }
    if (!props.privacyPolicyUrl) {
        console.error("please set `privacyPolicyUrl` in the props of BootstrapCookieConsentSettings")
    }
    if (!props.legalNoticeUrl) {
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

    // read the cookie, and if its content does not fit the categories, remove it
    const cookieContent = getCookie(this.props.cookieName)
    if (cookieContent) {
        try {
            for (const category of this.props.categories) {
                if (cookieContent[category] === undefined) {
                    console.log("cookie settings changed, removing settings cookie")
                    removeCookie(this.props.cookieName)
                    break
                }
            }
        } catch (e) {
            // problems with the cookie, remove it
            console.warn("cookie settings changed, removing settings cookie", e)
            removeCookie(this.props.cookieName)
        }
    }

    /**
     * Read the language file and render the modal
     */
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
            if (!categoryContent) {
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
            <p class="d-flex justify-content-between mb-0">
                ${linkLegalNotice}
                <a href="#bccs-options" data-bs-toggle="collapse">${self.content.mySettings}</a>
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
        if (!getCookie(self.props.cookieName) && self.props.autoShowModal) {
            showDialog()
        }
    }

    function showDialog() {
        documentReady(function () {
            self.modalElement = document.getElementById(self.props.modalId)
            if (!self.modalElement) {
                self.modalElement = document.createElement("div")
                self.modalElement.id = self.props.modalId
                self.modalElement.setAttribute("class", "modal fade")
                self.modalElement.setAttribute("tabindex", "-1")
                self.modalElement.setAttribute("role", "dialog")
                self.modalElement.setAttribute("aria-labelledby", self.props.modalId)
                self.modalElement.innerHTML = self.modalContent
                document.body.append(self.modalElement)
                if (self.props.postSelectionCallback) {
                    self.modalElement.addEventListener("hidden.bs.modal", function () {
                        self.props.postSelectionCallback()
                    })
                }
                self.modal = new bootstrap.Modal(self.modalElement, {
                    backdrop: "static",
                    keyboard: false
                })
                self.modal.show()
                self.buttonDoNotAgree = self.modalElement.querySelector("#bccs-buttonDoNotAgree")
                self.buttonAgree = self.modalElement.querySelector("#bccs-buttonAgree")
                self.buttonSave = self.modalElement.querySelector("#bccs-buttonSave")
                self.buttonAgreeAll = self.modalElement.querySelector("#bccs-buttonAgreeAll")
                updateButtons()
                updateOptionsFromCookie()
                self.modalElement.querySelector("#bccs-options").addEventListener("hide.bs.collapse", function () {
                    detailedSettingsShown = false
                    updateButtons()
                })
                self.modalElement.querySelector("#bccs-options").addEventListener("show.bs.collapse", function () {
                    detailedSettingsShown = true
                    updateButtons()
                })
                self.buttonDoNotAgree.addEventListener("click", function () {
                    doNotAgree()
                })
                self.buttonAgree.addEventListener("click", function () {
                    agreeAll()
                })
                self.buttonSave.addEventListener("click", function () {
                    saveSettings()
                })
                self.buttonAgreeAll.addEventListener("click", function () {
                    agreeAll()
                })
            } else {
                self.modal.show()
            }
        }.bind(this))
    }

    function updateOptionsFromCookie() {
        const settings = self.getSettings()
        if (settings) {
            for (let setting in settings) {
                const checkboxElement = self.modalElement.querySelector("#bccs-checkbox-" + setting)
                checkboxElement.checked = settings[setting] === "true"
            }
        }
        const checkboxNecessary = self.modalElement.querySelector("#bccs-checkbox-necessary")
        checkboxNecessary.checked = true
        checkboxNecessary.disabled = true
    }

    function updateButtons() {
        if (detailedSettingsShown) {
            self.buttonDoNotAgree.style.display = "none"
            self.buttonAgree.style.display = "none"
            self.buttonSave.style.removeProperty("display")
            self.buttonAgreeAll.style.removeProperty("display")
        } else {
            self.buttonDoNotAgree.style.removeProperty("display")
            self.buttonAgree.style.removeProperty("display")
            self.buttonSave.style.display = "none"
            self.buttonAgreeAll.style.display = "none"
        }
    }

    function gatherOptions(setAllTo = undefined) {
        const options = {}
        for (const category of self.props.categories) {
            if (setAllTo === undefined) {
                const checkbox = self.modalElement.querySelector("#bccs-checkbox-" + category)
                if (!checkbox) {
                    console.error("checkbox not found for category", category)
                }
                options[category] = checkbox.checked
            } else {
                options[category] = setAllTo
            }
        }
        options["necessary"] = true // necessary is necessary
        return options
    }

    function agreeAll() {
        setCookie(self.props.cookieName, gatherOptions(true), self.props.cookieStorageDays)
        self.modal.hide()
    }

    function doNotAgree() {
        setCookie(self.props.cookieName, gatherOptions(false), self.props.cookieStorageDays)
        self.modal.hide()
    }

    function saveSettings() {
        setCookie(self.props.cookieName, gatherOptions(), self.props.cookieStorageDays)
        self.modal.hide()
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
        request.onloadend = function () {
            if (request.status === 404 && lang !== self.props.defaultLang) {
                console.warn("language " + lang + " not found trying defaultLang " + self.props.defaultLang)
                fetchContent(self.props.defaultLang, callback)
            }
        }
        request.send(null)
    }

    function setCookie(name, object, days) {
        let expires = ""
        if (days) {
            const date = new Date()
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
            expires = "; expires=" + date.toUTCString()
        }
        const value = new URLSearchParams(object).toString()
        document.cookie = name + "=" + (value || "") + expires + "; Path=/; SameSite=Strict;"
        // store value also in localStorage
        localStorage.setItem(name, value)
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
                const urlSearchParams = new URLSearchParams(c.substring(nameEQ.length, c.length))
                const result = {}
                for (const [key, value] of urlSearchParams) {
                    result[key] = value
                }
                return result
            }
        }
        // if cookie not found, try localStorage
        const value = localStorage.getItem(name)
        if (value) {
            const urlSearchParams = new URLSearchParams(value)
            const result = {}
            for (const [key, value] of urlSearchParams) {
                result[key] = value
            }
            setCookie(name, result, self.props.cookieStorageDays)
            return result
        }
        return null
    }

    function removeCookie(name) {
        document.cookie = name + '=; Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    }

    function documentReady(callback) {
        if (document.readyState !== 'loading') {
            callback()
        } else {
            document.addEventListener('DOMContentLoaded', callback)
        }
    }

    // API
    this.showDialog = function () {
        showDialog()
    }
    this.getSettings = function (optionName) {
        const cookieContent = getCookie(self.props.cookieName)
        if (cookieContent) {
            if (optionName === undefined) {
                return cookieContent
            } else {
                if (cookieContent) {
                    return cookieContent[optionName]
                } else {
                    return false
                }
            }
        } else {
            return undefined
        }
    }
    this.setSetting = function (name, value) {
        let settings = self.getSettings() || {}
        for (const category of this.props.categories) {
            if(settings[category] === undefined) {
                settings[category] = true
            }
        }
        settings[name] = value
        setCookie(self.props.cookieName, settings, self.props.cookieStorageDays)
    }
}
