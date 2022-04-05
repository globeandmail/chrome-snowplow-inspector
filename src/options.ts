(() => {
  const tracking = document.getElementById("track") as HTMLInputElement;
  const compactCore = document.getElementById(
    "compactCore"
  ) as HTMLInputElement;
  const status = document.getElementById("status") as HTMLParagraphElement;
  const config = document.getElementById("config") as HTMLInputElement;
  const save = document.getElementById("save") as HTMLButtonElement;

  const showStoredSettings = () => {
    chrome.storage.sync.get(
      {
        enableTracking: true,
        compactCoreMetadata: false,
        sophiConfig: "",
      },
      (settings) => {
        tracking.checked = settings.enableTracking;
        compactCore.checked = settings.compactCoreMetadata;
        config.value = settings.sophiConfig || "";
      }
    );
  };

  const updateStoredSettings = () => {
    if (save.form?.checkValidity()) {
      chrome.storage.sync.set(
        {
          enableTracking: tracking.checked,
          compactCoreMetadata: compactCore.checked,
          sophiConfig: config.value,
        },
        () => {
          status.textContent = "Preferences Saved";
          setTimeout(() => (status.textContent = ""), 1800);
          showStoredSettings();
        }
      );
    }
  };

  showStoredSettings();
  save.addEventListener("click", updateStoredSettings, false);
})();
