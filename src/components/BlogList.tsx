// @ts-ignore
import { useLang, usePages } from '@rspress/core/runtime';
// @ts-ignore
import { getCustomMDXComponent } from '@rspress/core/theme';
import React, { useMemo, useState } from 'react';
import styles from './Blog.module.css';
import { RssSubscriptionLink } from './rssLink';
import { BorderBeam } from './BorderBeam';
import { useTiltEffect } from './useTiltEffect';

export interface BlogItem {
    title: string;
    date: string;
    description?: string;
    tags?: string[];
    cover?: string;
    link: string;
}

interface BlogListProps {
    rssLink?: boolean;
    blogPath?: string;
    rssPath?: string;
    openInNewTab?: boolean;
    featured?: boolean;
    interactive?: boolean;
    variant?: 'card' | 'list';
}

const getClassName = (...classNames: Array<string | false | undefined>) => {
    return classNames.filter(Boolean).join(' ');
};

const isTouchDevice = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    return window.matchMedia('(pointer: coarse)').matches;
};

export const useBlogPages = (blogPath: string = '/blog/'): BlogItem[] => {
    const { pages } = usePages();
    const lang = useLang();

    if (!blogPath.trim()) {
        console.warn('[blog-plugin] blogPath 不能为空，已回退到默认值 /blog/');
        blogPath = '/blog/';
    }

    return pages
        .filter((page: any) => page.lang === lang)
        .filter((page: any) => page.routePath.includes(blogPath) && !page.routePath.endsWith(blogPath))
        .map(({ frontmatter = {}, routePath, title, ...rest }: any) => {
            const { date, tags, cover, description, summary } = frontmatter as any;
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

type BlogCardProps = {
    post: BlogItem;
    isFeatured: boolean;
    interactive: boolean;
    lang: string;
    target: string;
};

function BlogCard({ post, isFeatured, interactive, lang, target }: BlogCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const isInteractive = interactive && Boolean(post.link);

    const formattedDate = new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(post.date));

    const cardClassName = getClassName(
        styles.card,
        isFeatured ? styles.featured : styles.normalCard,
        isInteractive && styles.interactiveCard,
    );

    const titleClassName = getClassName(
        styles.title,
        isFeatured && styles.featuredTitle,
    );

    const descriptionClassName = getClassName(
        styles.description,
        isFeatured && styles.featuredDescription,
    );

    const coverWrapperClassName = isFeatured ? styles.featuredCoverWrapper : styles.normalCoverWrapper;

    const cardContent = (
        <>
            {post.cover && (
                <div className={coverWrapperClassName}>
                    <img src={post.cover} alt={post.title} />
                </div>
            )}
            <span className={styles.date}>{formattedDate}</span>
            <div className={titleClassName}>{post.title}</div>
            {post.description && (
                <div className={descriptionClassName}>{post.description}</div>
            )}
            {post.tags && post.tags.length > 0 && (
                <div className={styles.tags}>
                    {post.tags.map(tag => (
                        <span key={tag} className={styles.tag}>
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
            {isInteractive && isHovered ? <BorderBeam size={2} duration={3} /> : null}
        </>
    );

    if (post.link) {
        return (
            <a
                className={cardClassName}
                href={post.link}
                target={target}
                rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                data-tilt-card={isInteractive ? 'true' : undefined}
                onMouseEnter={isInteractive ? () => setIsHovered(true) : undefined}
                onMouseLeave={isInteractive ? () => setIsHovered(false) : undefined}
            >
                {cardContent}
            </a>
        );
    }

    return <article className={cardClassName}>{cardContent}</article>;
}

function LegacyBlogList({
    blogPages,
    rssLink,
    rssPath,
    target,
    openInNewTab,
    lang,
}: {
    blogPages: BlogItem[];
    rssLink: boolean;
    rssPath: string;
    target: string;
    openInNewTab: boolean;
    lang: string;
}) {
    const { h2: H2, a: A, hr: Hr } = getCustomMDXComponent();

    return (
        <>
            {rssLink && (
                <div style={{ marginTop: '2em' }}>
                    <RssSubscriptionLink rssPath={rssPath} />
                </div>
            )}
            <div className={styles.legacyList}>
                {blogPages.map(({ title, date, description, tags, cover, link }, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <React.Fragment key={link}>
                            <article
                                className={`${styles.legacyBlogItem} ${isEven ? styles.legacyEven : styles.legacyOdd} ${cover ? styles.legacyHasCover : ''}`}
                            >
                                {cover && (
                                    <div
                                        className={styles.legacyCoverWrapper}
                                        onClick={() => window.open(link, target)}
                                    >
                                        <img src={cover} alt={title} className={styles.legacyCover} />
                                    </div>
                                )}
                                <div className={styles.legacyContent}>
                                    <H2 id={link}>
                                        <A href={link} target={target} rel={openInNewTab ? 'noopener noreferrer' : undefined}>{title}</A>
                                    </H2>
                                    <div className={styles.legacyMeta}>
                                        <div onClick={() => window.open(link, target)} className={styles.legacyDate}>
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
                                        <p onClick={() => window.open(link, target)} className={styles.legacyDescription}>
                                            {description}
                                        </p>
                                    )}
                                    {tags && tags.length > 0 && (
                                        <div className={styles.legacyTags}>
                                            {tags.map(tag => (
                                                <span key={tag} className={styles.legacyTag}>
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </article>
                            {index < blogPages.length - 1 && <Hr className={styles.divider} />}
                        </React.Fragment>
                    );
                })}
            </div>
        </>
    );
}

export const BlogList: React.FC<BlogListProps> = ({
    rssLink = true,
    blogPath = '/blog/',
    rssPath = '/blog/rss.xml',
    openInNewTab = false,
    featured = true,
    interactive = true,
    variant = 'card',
}) => {
    const blogPages = useBlogPages(blogPath);
    const lang = useLang();
    const target = openInNewTab ? '_blank' : '_self';

    if (variant === 'list') {
        return (
            <LegacyBlogList
                blogPages={blogPages}
                rssLink={rssLink}
                rssPath={rssPath}
                target={target}
                openInNewTab={openInNewTab}
                lang={lang}
            />
        );
    }

    const tiltDisabled = !interactive || isTouchDevice();

    const featuredPost = useMemo(() => {
        if (!featured || blogPages.length === 0) {
            return null;
        }
        return blogPages[0];
    }, [featured, blogPages]);

    const restPosts = useMemo(() => {
        if (!featured) {
            return blogPages;
        }
        return blogPages.slice(1);
    }, [featured, blogPages]);

    useTiltEffect('[data-tilt-card="true"]', {
        disabled: tiltDisabled,
    });

    return (
        <div className={styles.blogPage}>
            {rssLink && (
                <div className={styles.rssWrapper}>
                    <RssSubscriptionLink rssPath={rssPath} />
                </div>
            )}
            <div className={styles.cardList}>
                {featuredPost ? (
                    <BlogCard
                        post={featuredPost}
                        isFeatured
                        interactive={interactive}
                        lang={lang}
                        target={target}
                    />
                ) : null}
                {restPosts.length > 0 ? restPosts.map((post) => (
                    <BlogCard
                        key={post.link}
                        post={post}
                        isFeatured={false}
                        interactive={interactive}
                        lang={lang}
                        target={target}
                    />
                )) : null}
            </div>
        </div>
    );
};

export default BlogList;
