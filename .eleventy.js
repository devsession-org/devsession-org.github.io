const pluginRss = require('@11ty/eleventy-plugin-rss')
const pluginNavigation = require('@11ty/eleventy-navigation')
const pluginSvgSprite = require('eleventy-plugin-svg-sprite')
const markdownIt = require('markdown-it')

const filters = require('./utils/filters.js')
const transforms = require('./utils/transforms.js')
const shortcodes = require('./utils/shortcodes.js')

const Image = require('@11ty/eleventy-img')

async function imageShortcode(src, alt, sizes) {
    let metadata = await Image(src, {
        widths: [150, 300, 600, 900],
        formats: ['webp', 'jpeg'],
        outputDir: './dist/img/'
    })

    let imageAttributes = {
        alt,
        sizes,
        loading: 'lazy',
        decoding: 'async'
    }

    // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
    return Image.generateHTML(metadata, imageAttributes)
}

module.exports = function (config) {
    // Plugins
    config.addNunjucksAsyncShortcode('image', imageShortcode)
    config.addLiquidShortcode('image', imageShortcode)
    config.addJavaScriptFunction('image', imageShortcode)
    config.addPlugin(pluginRss)
    config.addPlugin(pluginNavigation)
    config.addPlugin(pluginSvgSprite, {
        path: './src/assets/icons',
        svgSpriteShortcode: 'iconsprite'
    })
    const md = new markdownIt({
        html: true
    })

    config.addPairedShortcode('markdown', (content) => {
        return md.render(content)
    })

    // Filters
    Object.keys(filters).forEach((filterName) => {
        config.addFilter(filterName, filters[filterName])
    })

    // Transforms
    Object.keys(transforms).forEach((transformName) => {
        config.addTransform(transformName, transforms[transformName])
    })

    // Shortcodes
    Object.keys(shortcodes).forEach((shortcodeName) => {
        config.addShortcode(shortcodeName, shortcodes[shortcodeName])
    })

    // Asset Watch Targets
    config.addWatchTarget('./src/assets')

    // Markdown
    config.setLibrary(
        'md',
        markdownIt({
            html: true,
            breaks: true,
            linkify: true,
            typographer: true
        })
    )

    // Layouts
    config.addLayoutAlias('base', 'base.njk')
    config.addLayoutAlias('post', 'post.njk')

    // Pass-through files
    config.addPassthroughCopy("CNAME");
    config.addPassthroughCopy('src/robots.txt')
    config.addPassthroughCopy('src/site.webmanifest')
    config.addPassthroughCopy('src/assets/images')
    config.addPassthroughCopy('src/assets/fonts')

    // Deep-Merge
    config.setDataDeepMerge(true)

    // Base Config
    return {
        dir: {
            input: 'src',
            output: 'dist',
            includes: 'includes',
            layouts: 'layouts',
            data: 'data'
        },
        templateFormats: ['njk', 'md', '11ty.js'],
        htmlTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk'
    }
}
