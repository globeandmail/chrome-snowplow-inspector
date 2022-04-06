import { default as m, ClosureComponent } from "mithril";

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
  return m
    .request({
      method: "GET",
      url: SOPHI_CONFIG_API + key,
      params: {
        cb: +new Date(),
      }
    })
    .then((config) => {
      if (typeof config === "object" && config) {
        if (
          config.hasOwnProperty("active") &&
          config.hasOwnProperty("key")
        ) {
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

export const SophiConfig: ClosureComponent<{
  setModal: ModalSetter;
  resolver: Resolver;
}> = (vnode) => {
  const { setModal, resolver } = vnode.attrs;

  chrome.storage.sync.get(
    { enableTracking: true, sophiConfig: "" },
    (settings) => {
      if (settings.sophiConfig) {
        getConfig(settings.sophiConfig, setModal, resolver);
      }
    }
  );

  return {
    view: () =>
      m("div.modal.is-active.sophi-config", [
        m("div.modal-background"),
        m("div.modal-card", [
          m("header.modal-card-head", [
            m("p.modal-card-title", "Welcome to Sophi"),
          ]),
          m(
            "section.modal-card-body",
            m(
              "form.form",
              m(
                "label",
                "Please enter your configuration key to continue",
                m(
                  `input.input[type=text][name=configKey][pattern="${uuidPattern}"][required]`,
                  {
                    oninput: (e: Event) => {
                      const { target } = e;
                      if (target instanceof HTMLInputElement) {
                        if (target.form && target.form.checkValidity()) {
                          getConfig(target.value, setModal, resolver).catch(
                            () =>
                              target.setCustomValidity(
                                "Invalid configuration key. Please contact Sophi.io for further assistance."
                              )
                          );
                        } else if (target.value && target.form) {
                          target.form.reportValidity();
                        }
                      }
                    },
                  }
                )
              )
            )
          ),
          m("footer.modal-card-foot"),
        ]),
      ]),
  };
};
