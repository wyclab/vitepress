import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
//#region articles/life/life-plan/management.md
var __pageData = JSON.parse("{\"title\":\"管理艺术\",\"description\":\"management\",\"frontmatter\":{\"title\":\"管理艺术\",\"description\":\"management\",\"date\":\"2026-05-29T00:00:00.000Z\",\"category\":\"生活指南\",\"tags\":[\"人生主线\"],\"order\":2},\"headers\":[],\"relativePath\":\"articles/life/life-plan/management.md\",\"filePath\":\"articles/life/life-plan/management.md\",\"articleMeta\":{\"published\":\"2026-05-29\",\"updated\":\"2026-09-19\",\"words\":112,\"minutes\":1,\"draft\":false}}");
var _sfc_main = { name: "articles/life/life-plan/management.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><p>共产主义是靠权力分配。</p><p>资本主义是靠资源分配。</p><p>无论是什么主义，就和企业一样，都需要分享利润和好处，才有人跟随。</p><p>工作量呈正三角从上往下层层加码，财富额呈倒三角从下往上层层搜刮，要求基层用最低成本最高效率完成最多工作，不累就怪了。</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("articles/life/life-plan/management.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var management_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, management_default as default };
