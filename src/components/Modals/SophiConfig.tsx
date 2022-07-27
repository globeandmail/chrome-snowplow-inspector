import { h, FunctionComponent } from "preact";
import { useEffect } from "preact/hooks";

import { ModalSetter } from ".";
import { buildRegistry, Resolver } from "../../ts/iglu";

const SOPHI_CONFIG_API = process.env.CONFIG_ENDPOINT;
const uuidPattern =
  "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";

export type SophiDataInspectorConfig = {
  key: string;
  active: boolean;
  client: string;
  registries: Parameters<typeof buildRegistry>[number][];
  products: string[];
  custom: {}[];
};

const getConfig = (key: string, setModal: ModalSetter, resolver: Resolver) => {
  return fetch(`${SOPHI_CONFIG_API}${key}?cb=${+new Date()}`)
    .then((resp) => resp.json())
    .then((config) => {
      if (typeof config === "object" && config) {
        if (config.hasOwnProperty("active") && config.hasOwnProperty("key")) {
          const sdic = config as SophiDataInspectorConfig;
          if (sdic.active && sdic.key === key) {
            chrome.storage.sync.set({ sophiConfig: key }, () => {
              resolver.import(true, ...sdic.registries.map(buildRegistry));
              resolver.walk();
              setModal(undefined, { sophiConfig: sdic });
            });
            return;
          }
        }
      }

      throw new Error("Unexpected Sophi configuration result");
    });
};

export const SophiConfig: FunctionComponent<{
  setModal: ModalSetter;
  resolver: Resolver;
}> = ({ setModal, resolver }) => {
  useEffect(
    () =>
      chrome.storage.sync.get(
        { enableTracking: true, sophiConfig: "" },
        (settings) => {
          if (settings.sophiConfig) {
            getConfig(settings.sophiConfig, setModal, resolver);
          }
        }
      ),
    []
  );

  return (
    <div class="modal is-active sophi-config">
      <div class="modal-background" />
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Welcome to Sophi</p>
        </header>
        <section class="modal-card-body">
          <form class="form">
            <label>
              Please enter your configuration key to continue
              <input
                class="input"
                type="text"
                name="configKey"
                pattern={uuidPattern}
                required
                onInput={({ currentTarget }) => {
                  if (
                    currentTarget.form &&
                    currentTarget.form.checkValidity()
                  ) {
                    getConfig(currentTarget.value, setModal, resolver).catch(
                      () =>
                        currentTarget.setCustomValidity(
                          "Invalid configuration key. Please contact Sophi.io for further assistance."
                        )
                    );
                  } else if (currentTarget.value && currentTarget.form) {
                    currentTarget.form.reportValidity();
                  }
                }}
              />
            </label>
          </form>
        </section>
        <footer class="modal-card-foot"></footer>
      </div>
    </div>
  );
};
