import { LitElement, html } from "lit-element";
import styles from "./styles";
import { parseEntity } from "./utils";
import filterEntity from "./filterEntity";
import { name, version } from "../package.json";

function printVersion(version) {
  console.info(`%c${name}: ${version}`, "font-weight: bold");
}

printVersion(version);

class AdvancedGlanceCard extends LitElement {
  static get properties() {
    return {
      config: Object,
      _hass: Object,
    };
  }

  static get styles() {
    return [styles];
  }

  constructor() {
    super();
    this.config = {};
    this._hass = {};
  }

  setConfig(config) {
    if (!config.entities || config.entities.length === 0) {
      throw new Error("You need to define at least one entity");
    }

    this.entities = (config.entities || []).map(parseEntity);
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
  }

  render() {
    return html`
      <ha-card
        style="--glance-column-width:${100 /
        Math.min(this.entities.length, 3)}%;"
      >
        ${this.renderHeader(this.config.title)}
        <slot></slot>
        <div class="entities">
          ${this.entities.map((entity) => this.renderEntity(entity))}
        </div>
        ${this.config.footer ? this.renderHeader(this.config.footer) : ""}
      </ha-card>
    `;
  }

  renderHeader(title) {
    if (typeof title === "string" || Object.keys(title).length < 2) {
      return html` <h1 class="card-header">${title}</h1> `;
    } else {
      const defaultWidth = 100 / Object.keys(title).length;
      const getWidth = (title) =>
        title ? title.width || defaultWidth : defaultWidth;
      const getDisplay = (title) =>
        typeof title === "undefined" ? "none" : "inline-block";
      const getAlign = (title, defaultValue) =>
        (title ? title.align : "") || defaultValue;
      const getColor = (title) => {
        if (title && typeof title.color === "string") {
          return `color: ${title.color}`;
        } else if (Array.isArray(title)) {
          title = title.filter((e) => filterEntity(e, this._hass.states))[0];
          return getColor(title);
        }

        return "";
      };

      const getText = (title) => {
        if (typeof title === "undefined") {
          return "";
        } else if (typeof title === "string") {
          return title;
        } else if (typeof title.text === "string") {
          return title.text;
        } else if (title.entity) {
          return this.renderDomainCover(title.entity);
        } else if (Array.isArray(title)) {
          title = title.filter((e) => filterEntity(e, this._hass.states))[0];
          return getText(title);
        } else {
          throw new Error("Invalid title: " + JSON.stringify(title));
        }
      };

      return html`
        <div>
          <h1
            class="card-header"
            style="display: ${getDisplay(
              title.left
            )}; float: left; width: calc(${getWidth(
              title.left
            )}% - 32px); text-align: ${getAlign(title.left, "left")};${getColor(
              title.left
            )}"
          >
            ${getText(title.left)}
          </h1>
          <h1
            class="card-header"
            style="display: ${getDisplay(title.center)}; width: calc(${getWidth(
              title.center
            )}% - 32px); text-align: ${getAlign(
              title.center,
              "center"
            )};${getColor(title.center)}"
          >
            ${getText(title.center)}
          </h1>
          <h1
            class="card-header"
            style="display: ${getDisplay(
              title.right
            )}; float: right; width: calc(${getWidth(
              title.right
            )}% - 32px); text-align: ${getAlign(
              title.right,
              "right"
            )};${getColor(title.right)}"
          >
            ${getText(title.right)}
          </h1>
        </div>
      `;
    }
  }

  renderDomainCover(entity) {
    const stateObj = this._hass.states[entity];
    const isclosed =
      stateObj.attributes && typeof stateObj.attributes.current_position
        ? stateObj.attributes.current_position === 0.0
        : stateObj.state === "closed";
    const isopen =
      stateObj.attributes && typeof stateObj.attributes.current_position
        ? stateObj.attributes.current_position === 100.0
        : stateObj.state === "open";

    return html`
      <div class="entity-state" style="${this.grid(1)}">
        <span class="entity-value">
          <ha-icon-button
            ?disabled=${isopen}
            icon="hass:arrow-up"
            role="button"
            @click=${this._service("cover", "open_cover", entity)}
          ></ha-icon-button>
          <ha-icon-button
            icon="hass:stop"
            role="button"
            @click=${this._service("cover", "stop_cover", entity)}
          ></ha-icon-button>
          <ha-icon-button
            ?disabled=${isclosed}
            icon="hass:arrow-down"
            role="button"
            @click=${this._service("cover", "close_cover", entity)}
          ></ha-icon-button>
        </span>
      </div>
    `;
  }

  grid(index = 1) {
    if (index === "full" || index > this.rowSize) {
      return `grid-column: span ${this.rowSize};`;
    }
    return `grid-column: span ${index};`;
  }

  _service(domain, action, entity_id) {
    return () => this._hass.callService(domain, action, { entity_id });
  }

  renderEntity(entity) {
    const stateObj = this._hass.states[entity.entity];
    const onClick = () => {
      if (!entity.tap_action) {
        this.openEntityPopover(entity.entity);
      } else {
        // @todo: Replace this handler with
        // https://github.com/custom-cards/custom-card-helpers/blob/b5add47ec1a58bea9d184133b6d33a5119718c32/src/handle-action.ts
        if (entity.tap_action.action === "call-service") {
          const [domain, action] = entity.tap_action.service.split(".");
          this._hass.callService(
            domain,
            action,
            entity.tap_action.service_data
          );
        } else {
          throw new Error(
            "Unsupported action type: " + entity.tap_action.action
          );
        }
      }
    };

    return html`
      <div class="entity" @click=${onClick}>
        <div class="name">
          ${"name" in entity ? entity.name : this.computeStateName(stateObj)}
        </div>
        <state-badge
          hass=${this._hass}
          .stateObj=${stateObj}
          .overrideIcon=${undefined}
          .overrideImage=${undefined}
          .stateColor=${true}
        ></state-badge>
      </div>
    `;
  }

  computeStateName(stateObj) {
    return stateObj.attributes.friendly_name === undefined
      ? this.computeObjectId(stateObj.entity_id).replace(/_/g, " ")
      : stateObj.attributes.friendly_name || "";
  }

  computeObjectId(entityId) {
    return entityId.substr(entityId.indexOf(".") + 1);
  }

  openEntityPopover(entityId) {
    this.fire("hass-more-info", { entityId });
  }

  fire(type, detail, options) {
    options = options || {};
    detail = detail === null || detail === undefined ? {} : detail;
    const e = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed,
    });
    e.detail = detail;
    this.dispatchEvent(e);
    return e;
  }
}

window.customElements.define("advanced-glance-card", AdvancedGlanceCard);

// Configure the preview in the Lovelace card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: "advanced-glance-card",
  name: "Extended Glance Card",
  preview: false,
  description: "TODO",
});

export default AdvancedGlanceCard;
