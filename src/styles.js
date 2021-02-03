import { css } from "lit-element";

export default css`
ha-card {
  height: 100%;
}
.entities {
  display: flex;
  padding: 0 16px 4px;
  flex-wrap: wrap;
  box-sizing: border-box;
  align-content: center;
}
.entities.no-header {
  padding-top: 16px;
}

.card-header {
  color: var(--ha-card-header-color, --primary-text-color);
  font-family: var(--ha-card-header-font-family, inherit);
  font-size: var(--ha-card-header-font-size, 24px);
  letter-spacing: -0.012em;
  line-height: 48px;
  padding: 12px 16px 16px;
  display: block;
  margin-block: 0px;
  font-weight: normal;
}
.entity {
  box-sizing: border-box;
  padding: 0 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  margin-bottom: 12px;
  width: var(--glance-column-width, 20%);
}
.entity:focus {
  outline: none;
  background: var(--divider-color);
  border-radius: 14px;
  padding: 4px;
  margin: -4px 0;
}
.entity div {
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.name {
  min-height: var(--paper-font-body1_-_line-height, 20px);
}
state-badge {
  margin: 8px 0;
}
`;
