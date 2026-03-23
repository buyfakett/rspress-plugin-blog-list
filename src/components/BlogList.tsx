// @ts-ignore
import { useLang, usePages } from '@rspress/core/runtime';
// @ts-ignore
import { getCustomMDXComponent } from '@rspress/core/theme';
import React from 'react';
import styles from './Blog.module.css';
import { RssSubscriptionLink } from './rssLink';

export interface BlogItem {
    title: string;
    date: string;
    description?: string;
    tags?: string[];
    cover?: string;
    link: string;
}

interface BlogListProps {
    /**
     * 是否显示 RSS 订阅链接
     * @default true
     */
    rssLink?: boolean;
    /**
     * 博客文章路径
     * @default '/blog/'
     */
    blogPath?: string;
    /**
     * RSS 订阅路径
     * @default '/blog/rss.xml'
     */
    rssPath?: string;
}


export const useBlogPages = (blogPath: string = '/blog/'): BlogItem[] => {
    const {pages} = usePages();
    const lang = useLang();

    if (!blogPath.trim()) {
        console.warn('[blog-plugin] blogPath 不能为空，已回退到默认值 /blog/');
        blogPath = '/blog/';
    }

    return pages
        .filter((page: any) => page.lang === lang)
        .filter((page: any) => page.routePath.includes(blogPath) && !page.routePath.endsWith(blogPath))
        .map(({frontmatter = {}, routePath, title, ...rest}: any) => {
            const {date, tags, cover, description, summary} = frontmatter as any;
            const finalDate = date;

            if (!finalDate) {
                return null;
            }

            let finalSummary = summary || description;
            if (!finalSummary) {
                finalSummary = `这是一篇关于"${title}"的文章。点击阅读更多了解详细内容。`;
            }

            return {
                title: title,
                date: String(finalDate),
                description: finalSummary,
                tags: Array.isArray(tags) ? tags : undefined,
                cover,
                link: routePath,
            };
        })
        .filter((item: any): item is BlogItem => item !== null)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const BlogList: React.FC<BlogListProps> = ({rssLink = true, blogPath = '/blog/', rssPath = '/blog/rss.xml'}) => {
    const {h2: H2, p: P, a: A, hr: Hr} = getCustomMDXComponent();
    const blogPages = useBlogPages(blogPath);
    const lang = useLang();

    return (
        <>
            {rssLink && (
                <div style={{marginTop: '2em'}}>
                    <RssSubscriptionLink rssPath={rssPath}/>
                </div>
            )}
            <div className={styles.blogList}>
                {blogPages.map(({title, date, description, tags, cover, link}, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <React.Fragment key={link}>
                            <article
                                className={`${styles.blogItem} ${isEven ? styles.even : styles.odd} ${cover ? styles.hasCover : ''}`}>
                                {cover && (
                                    <div
                                        className={styles.coverWrapper}
                                        onClick={() => window.open(link, '_blank')}
                                    >
                                        <img src={cover} alt={title} className={styles.cover}/>
                                    </div>
                                )}
                                <div className={styles.content}>
                                    <H2 id={link}>
                                        <A href={link} target="_blank" rel="noopener noreferrer">{title}</A>
                                    </H2>
                                    <div className={styles.meta}>
                                        <div onClick={() => window.open(link, '_blank')} className={styles.date}>
                                            {new Intl.DateTimeFormat(lang, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                second: 'numeric',
                                                timeZone: 'UTC',
                                            }).format(new Date(date))}
                                        </div>
                                    </div>
                                    {description && (
                                        <p onClick={() => window.open(link, '_blank')} className={styles.description}>
                                            {description}
                                        </p>
                                    )}
                                    {tags && tags.length > 0 && (
                                        <div className={styles.tags}>
                                            {tags.map(tag => (
                                                <span key={tag} className={styles.tag}>
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </article>
                            {index < blogPages.length - 1 && <Hr className={styles.divider}/>}
                        </React.Fragment>
                    );
                })}
            </div>
        </>
    );
};

export default BlogList;
