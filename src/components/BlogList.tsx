// @ts-ignore
import { useLang, usePages } from '@rspress/core/runtime';
// @ts-ignore
import { getCustomMDXComponent } from '@rspress/core/theme';
import React, { useEffect, useMemo, useState } from 'react';
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
    variant?: 'modern' | 'simple';
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

type BlogCardProps = {
    post: BlogItem;
    isFeatured: boolean;
    index: number;
    interactive: boolean;
    lang: string;
    target: string;
};

function BlogCard({post, isFeatured, index, interactive, lang, target}: BlogCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const isInteractive = interactive && Boolean(post.link);
    const isEven = index % 2 === 0;

    const formattedDate = new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(post.date));

    const cardClassName = getClassName(
        styles.card,
        isFeatured ? styles.featured : styles.normalCard,
        !isFeatured && isEven && styles.cardEven,
        !isFeatured && !isEven && styles.cardOdd,
        !isFeatured && post.cover && styles.cardHasCover,
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
                    <img src={post.cover} alt={post.title}/>
                </div>
            )}
            <div className={styles.cardContent}>
                <span className={styles.date}>{formattedDate}</span>
                <h2 id={post.link} className={`${titleClassName} rp-toc-include`}>{post.title}</h2>
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
            </div>
            {isInteractive && isHovered ? <BorderBeam size={2} duration={3}/> : null}
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

function SimpleBlogList({
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
    const {h2: H2, a: A, hr: Hr} = getCustomMDXComponent();

    return (
        <>
            {rssLink && (
                <div style={{marginTop: '2em'}}>
                    <RssSubscriptionLink rssPath={rssPath}/>
                </div>
            )}
            <div className={styles.simpleList}>
                {blogPages.map(({title, date, description, tags, cover, link}, index) => {
                    const isEven = index % 2 === 0;
                    return (
                        <React.Fragment key={link}>
                            <article
                                className={`${styles.simpleBlogItem} ${isEven ? styles.simpleEven : styles.simpleOdd} ${cover ? styles.simpleHasCover : ''}`}
                            >
                                {cover && (
                                    <div
                                        className={styles.simpleCoverWrapper}
                                        onClick={() => window.open(link, target)}
                                    >
                                        <img src={cover} alt={title} className={styles.simpleCover}/>
                                    </div>
                                )}
                                <div className={styles.simpleContent}>
                                    <H2 id={link}>
                                        <A href={link} target={target}
                                           rel={openInNewTab ? 'noopener noreferrer' : undefined}>{title}</A>
                                    </H2>
                                    <div className={styles.simpleMeta}>
                                        <div onClick={() => window.open(link, target)} className={styles.simpleDate}>
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
                                        <p onClick={() => window.open(link, target)}
                                           className={styles.simpleDescription}>
                                            {description}
                                        </p>
                                    )}
                                    {tags && tags.length > 0 && (
                                        <div className={styles.simpleTags}>
                                            {tags.map(tag => (
                                                <span key={tag} className={styles.simpleTag}>
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
}

function BlogToc({blogPages}: { blogPages: BlogItem[] }) {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        if (blogPages.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                }
            },
            {rootMargin: '-80px 0px -70% 0px'},
        );

        blogPages.forEach(page => {
            const el = document.getElementById(page.link);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [blogPages]);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
    };

    if (blogPages.length === 0) return null;

    return (
        <div className={styles.blogToc}>
            <div className={styles.blogTocTitle}>ON THIS PAGE</div>
            <nav className={styles.blogTocList}>
                {blogPages.map(page => (
                    <div
                        key={page.link}
                        className={`${styles.blogTocItem} ${activeId === page.link ? styles.blogTocItemActive : ''}`}
                        onClick={() => scrollTo(page.link)}
                    >
                        <span className={styles.blogTocItemText}>{page.title}</span>
                    </div>
                ))}
            </nav>
        </div>
    );
}

export const BlogList: React.FC<BlogListProps> = ({
                                                      rssLink = true,
                                                      blogPath = '/blog/',
                                                      rssPath = '/blog/rss.xml',
                                                      openInNewTab = false,
                                                      featured = true,
                                                      interactive = true,
                                                      variant = 'modern',
                                                  }) => {
    const blogPages = useBlogPages(blogPath);
    const lang = useLang();
    const target = openInNewTab ? '_blank' : '_self';

    if (variant === 'simple') {
        return (
            <SimpleBlogList
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
                    <RssSubscriptionLink rssPath={rssPath}/>
                </div>
            )}
            <div className={styles.cardList}>
                {featuredPost ? (
                    <BlogCard
                        post={featuredPost}
                        isFeatured
                        index={0}
                        interactive={interactive}
                        lang={lang}
                        target={target}
                    />
                ) : null}
                {restPosts.length > 0 ? restPosts.map((post, index) => (
                    <BlogCard
                        key={post.link}
                        post={post}
                        isFeatured={false}
                        index={featured ? index + 1 : index}
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
