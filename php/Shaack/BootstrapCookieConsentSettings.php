<?php
namespace Shaack;

/**
 * Helper class, to handle the `bootstrap-cookie-content-settings` from a PHP backend.
 * @author Stefan Haack (https://shaack.com)
 */
class BootstrapCookieConsentSettings {

    private string $cookieName;
    private int $cookieStorageDays;

    public function __construct(string $cookieName = "cookie-consent-settings", int $cookieStorageDays = 365)
    {
        $this->cookieName = $cookieName;
        $this->cookieStorageDays = $cookieStorageDays;
    }

    /**
     * Read the whole consent cookie into an array.
     * @return array
     */
    public function getSettings() : array {
        return json_decode(@$_COOKIE[$this->cookieName], true) ?? [];
    }

    /**
     * Write a value to the consent cookie.
     * @param string $optionName
     * @return bool
     */
    public function getSetting(string $optionName) : bool {
        return !!$this->getSettings()[$optionName];
    }

    /**
     * Write an array of values to the consent cookie.
     * @param array $settings
     * @return void
     */
    public function setSettings(array $settings) : void {
        $settings["necessary"] = true;
        setcookie($this->cookieName, json_encode($settings), time() + (86400 * $this->cookieStorageDays), "/");
    }

    /**
     * Read a value from the consent cookie.
     * @param string $optionName
     * @param bool $value
     * @return void
     */
    public function setSetting(string $optionName, bool $value) : void {
        $settings = $this->getSettings();
        $settings[$optionName] = $value;
        $this->setSettings($settings);
    }

}
