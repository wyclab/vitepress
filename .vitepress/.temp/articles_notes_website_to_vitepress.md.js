import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
//#region articles/notes/website/to_vitepress.md
var __pageData = JSON.parse("{\"title\":\"迁移至Vitepress，构建文档库类型的博客\",\"description\":\"收集碎片化文章，形成树状专题。\",\"frontmatter\":{\"title\":\"迁移至Vitepress，构建文档库类型的博客\",\"sidebarTitle\":\"Vitepress知识库博客\",\"description\":\"收集碎片化文章，形成树状专题。\",\"date\":\"2026-09-19T00:00:00.000Z\",\"category\":\"随笔\",\"tags\":[\"建站笔记\",\"AI\"]},\"headers\":[],\"relativePath\":\"articles/notes/website/to_vitepress.md\",\"filePath\":\"articles/notes/website/to_vitepress.md\",\"articleMeta\":{\"published\":\"2026-09-19\",\"updated\":\"2026-10-01\",\"words\":880,\"minutes\":2,\"draft\":false}}");
var _sfc_main = { name: "articles/notes/website/to_vitepress.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><p>思来想去，还是一个文档库类型的博客更适合我。在AI时代，人人都可以做产品经理，只要有想法，就可以尝试实现。于是基于vitepress构建了此版本的博客。</p><h2 id="网站构思" tabindex="-1">网站构思 <a class="header-anchor" href="#网站构思" aria-label="Permalink to “网站构思”">​</a></h2><ol><li><strong>文档树而非时间轴：</strong>将文章划分为几个专题，特定的专题有特定的侧边栏，文章归入专题中并按照文档树梳理，而非传统博客的时间轴。随着博客文章的积累，可以形成相对系统化的知识库，避免碎片化知识。</li><li><strong>兼顾传统博客：</strong>在首页提供“最新文章”，在菜单栏提供“文章”，仍是按照时间轴更新，提供传统博客的阅读体验。</li><li>必须静态化，部署到类似Edgeone或者Cloudflare Pages，免维护且0成本。</li></ol><h2 id="搭建过程如下" tabindex="-1">搭建过程如下 <a class="header-anchor" href="#搭建过程如下" aria-label="Permalink to “搭建过程如下”">​</a></h2><ol><li>搭建vitepress（<a href="https://vitepress.dev/zh/" target="_blank" rel="noreferrer">https://vitepress.dev/zh/</a>），看不懂没关系，直接让workbuddy等AI agent实现。为什么使用vitepress？因为没必要让AI从零开始写，直接用现有的文档框架，站在巨人的肩膀上。</li><li>将Markdown文件搬家，从老博客搬到新路径，推荐直接用AI agent处理，AI可以快速批量调整文章的frontmatter、调整图片路径、重新命名、归档等等，非常便捷也不会出错。</li><li>根据自己的喜好，要求在首页提供“最新文章”，在菜单栏提供“文章”并按照时间轴排序，并进行其他类似于黑夜模式、样式风格的美化等。</li><li>GitHub+Edgeone部署。方便后续撰写新内容。</li></ol><h2 id="拓展功能" tabindex="-1">拓展功能 <a class="header-anchor" href="#拓展功能" aria-label="Permalink to “拓展功能”">​</a></h2><h2 id="_1-增加twikoo评论" tabindex="-1">1.增加twikoo评论 <a class="header-anchor" href="#_1-增加twikoo评论" aria-label="Permalink to “1.增加twikoo评论”">​</a></h2><p>twikoo的后端支持免费部署在Edgeone，详见<a href="https://twikoo.js.org/backend.html#edgeone-makers-%E9%83%A8%E7%BD%B2" target="_blank" rel="noreferrer">EdgeOne Makers 部署</a>。后端部署之后，博客前端引用，直接交给小弟workbuddy。</p><blockquote><p>给网站的文章页面和关于页面、友链页面增加评论区，使用twikoo，这是他的文档<a href="https://twikoo.js.org/%E3%80%82" target="_blank" rel="noreferrer">https://twikoo.js.org/。</a> 已经建立好了后端 twikoo.wyclab.com</p></blockquote></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("articles/notes/website/to_vitepress.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var to_vitepress_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, to_vitepress_default as default };
