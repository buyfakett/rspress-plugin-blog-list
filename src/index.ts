// @ts-ignore
import type { RspressPlugin } from '@rspress/core';
import path from 'path';

/**
 * Rspress plugin for adding an automatic blog page
 */
export function pluginBlogList(): RspressPlugin {
    return {
        name: 'rspress-plugin-blog-list',

        // Register the BlogList component as a global component available in MDX
        markdown: {
            globalComponents: [
                path.join(__dirname, 'components', 'BlogList.js')
            ]
        }
    };
}

export default pluginBlogList;