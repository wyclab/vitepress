import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
//#region articles/invest/basics/meigu.md
var __pageData = JSON.parse("{\"title\":\"美股\",\"description\":\"美股是投资必备的标的\",\"frontmatter\":{\"title\":\"美股\",\"description\":\"美股是投资必备的标的\",\"date\":\"2026-05-29T00:00:00.000Z\",\"category\":\"投资笔记\",\"tags\":[\"基础知识\"],\"order\":2},\"headers\":[],\"relativePath\":\"articles/invest/basics/meigu.md\",\"filePath\":\"articles/invest/basics/meigu.md\",\"articleMeta\":{\"published\":\"2026-05-29\",\"updated\":\"2026-09-19\",\"words\":52,\"minutes\":1,\"draft\":false}}");
var _sfc_main = { name: "articles/invest/basics/meigu.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h2 id="资料" tabindex="-1">资料 <a class="header-anchor" href="#资料" aria-label="Permalink to “资料”">​</a></h2><p><strong>美股编年史</strong> 美股百年走势、估值与回撤</p><p><a href="https://historyofmarket.com" target="_blank" rel="noreferrer">https://historyofmarket.com</a></p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("articles/invest/basics/meigu.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var meigu_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, meigu_default as default };
