import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
//#region articles/life/productivity/index.md
var __pageData = JSON.parse("{\"title\":\"生产力\",\"description\":\"生产力 栏目首页\",\"frontmatter\":{\"title\":\"生产力\",\"description\":\"生产力 栏目首页\"},\"headers\":[],\"relativePath\":\"articles/life/productivity/index.md\",\"filePath\":\"articles/life/productivity/index.md\"}");
var _sfc_main = { name: "articles/life/productivity/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="生产力" tabindex="-1">生产力 <a class="header-anchor" href="#生产力" aria-label="Permalink to “生产力”">​</a></h1><p>这里汇总「生产力」栏目下的文章。在该目录下新建 <code>.md</code> 文件并写好 frontmatter 的 <code>title</code> 和 <code>date</code>，侧边栏会自动更新。标题较长时可加 <code>sidebarTitle</code> 字段作为侧边栏短标题（文章页仍显示完整 <code>title</code>）。</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("articles/life/productivity/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var productivity_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, productivity_default as default };
