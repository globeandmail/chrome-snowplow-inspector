import { h, FunctionComponent } from "preact";
import { useMemo, useRef, useState } from "preact/hooks";

import { Registry, Resolver } from "../../ts/iglu";
import { ModalSetter } from "../../components/Modals";

import { Directory } from "./Directory";
import { RegistryList } from "./RegistryList";

type Filter = {
  search?: RegExp;
  selections: Registry[];
};

type SchemaManagerAttributes = {
  resolver: Resolver;
  setModal: ModalSetter;
};

export const SchemaManager: FunctionComponent<SchemaManagerAttributes> = ({
  resolver,
  setModal,
}) => {
  const [filters, setFilters] = useState<Filter>({
    search: undefined,
    selections: [],
  });

  const filterRegistries = (selections: Registry[]) =>
    setFilters((filters) => ({ ...filters, selections }));

  const clearSearch = () =>
    setFilters((filters) => ({ ...filters, search: undefined }));

  const [collapsed, setCollapsed] = useState(true);

  const [watermark, setWatermark] = useState(Date.now());

  const smRef = useRef<HTMLElement>(null);

  return (
    <section class="schema-manager columns section" ref={smRef}>
      <Directory
        setCollapsed={setCollapsed}
        resolver={resolver}
        watermark={watermark}
        {...filters}
      >
        <div class="field is-grouped filterPanel">
          <input
            class="input"
            type="search"
            placeholder="Filter Pattern"
            title="Regular expression to search schemas for"
            onKeyUp={(event) => {
              const target = event.currentTarget;
              if (!target.value.trim()) return clearSearch();

              try {
                const re = new RegExp(target.value, "im");
                target.setCustomValidity("");
                setFilters((filters) => ({ ...filters, search: re }));
              } catch {
                target.setCustomValidity("Invalid regular expression");
                target.reportValidity();
              }
            }}
          />
          <button
            class="button"
            onClick={() => {
              if (smRef.current) {
                const details = smRef.current.getElementsByTagName("details");
                Array.from(details).forEach((det) => (det.open = collapsed));
                setCollapsed((collapsed) => !collapsed);
              }
            }}
          >
            {collapsed ? "Expand All" : "Collapse All"}
          </button>
        </div>
      </Directory>
      <RegistryList
        filterRegistries={filterRegistries}
        clearSearch={clearSearch}
        resolver={resolver}
        setModal={setModal}
        setWatermark={setWatermark}
        selectedRegistries={filters.selections}
      />
    </section>
  );
};
