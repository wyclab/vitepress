import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
//#region articles/notes/diary/index.md
var __pageData = JSON.parse("{\"title\":\"日记\",\"description\":\"日记 栏目首页\",\"frontmatter\":{\"title\":\"日记\",\"description\":\"日记 栏目首页\"},\"headers\":[],\"relativePath\":\"articles/notes/diary/index.md\",\"filePath\":\"articles/notes/diary/index.md\"}");
var _sfc_main = { name: "articles/notes/diary/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="日记" tabindex="-1">日记 <a class="header-anchor" href="#日记" aria-label="Permalink to “日记”">​</a></h1><p>这里汇总「日记」栏目下的文章。在该目录下新建 <code>.md</code> 文件并写好 frontmatter 的 <code>title</code> 和 <code>date</code>，侧边栏会自动更新。标题较长时可加 <code>sidebarTitle</code> 字段作为侧边栏短标题（文章页仍显示完整 <code>title</code>）。</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("articles/notes/diary/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var diary_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, diary_default as default };
