sh.bccs.template = function(t) {
    return `<div class="modal-dialog modal-lg shadow" role="document">
    <div class="modal-content">
        <div class="modal-header">
            <h4 class="modal-title">${t.title}</h4>
        </div>
        <div class="modal-body">
            <div class="bccs-body-text" style="font-size: 80%">
                <p>${t.mainText}</p>
            </div>
            <p class="d-flex justify-content-between">
                <a href="../examples/legal-pages-dummy/legal-notice.html">${t.legalNotice}</a>
                <a href="#bccs-options" data-bs-toggle="collapse">${t.mySettings}</a>
            </p>
            <div id="bccs-options" class="collapse">
                <div class="bccs-option" data-name="necessary">
                    <div class="form-check mb-1">
                        <input type="checkbox" checked disabled class="form-check-input" id="bccs-checkboxNecessary">
                        <label class="form-check-label" for="bccs-checkboxNecessary"><b>${t.categories.necessary.name}</b></label>
                    </div>
                    <ul>
                        <li>${t.categories.necessary.description[0]}</li>
                    </ul>
                </div>
                <div class="bccs-option" data-name="analyses">
                    <div class="form-check mb-1">
                        <input type="checkbox" class="form-check-input" id="bccs-checkboxAnalyses">
                        <label class="form-check-label" for="bccs-checkboxAnalyses"><b>${t.categories.analyses.name}</b></label>
                    </div>
                    <ul>
                        <li>${t.categories.analyses.description[0]}</li>
                        <li>${t.categories.analyses.description[1]}</li>
                    </ul>
                </div>
                <div class="bccs-option" data-name="personalization">
                    <div class="form-check mb-1">
                        <input type="checkbox" class="form-check-input" id="bccs-checkboxPersonalization">
                        <label class="form-check-label" for="bccs-checkboxPersonalization"><b>${t.categories.personalization.name}</b></label>
                    </div>
                    <ul>
                        <li>${t.categories.personalization.description[0]}</li>
                        <li>${t.categories.personalization.description[1]}</li>
                        <li>${t.categories.personalization.description[2]}</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button id="bccs-buttonDoNotAgree" type="button"
                    class="btn btn-link text-decoration-none">
                ${t.notAgree}
            </button>
            <button id="bccs-buttonAgree" type="button" class="btn btn-primary">${t.agree}</button>
            <button id="bccs-buttonSave" type="button" class="btn btn-outline-dark">${t.saveSelection}</button>
            <button id="bccs-buttonAgreeAll" type="button" class="btn btn-primary">${t.agreeAll}</button>
        </div>
    </div>
</div>`
}