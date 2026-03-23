import React from "react";
// @ts-ignore
import { useDark } from "@rspress/core/runtime";

export const RssSubscriptionLink: React.FC<{ rssPath: string }> = ({ rssPath }) => {
    // 获取暗黑模式状态
    // Get dark mode status
    const isDark = useDark();

    // 根据暗黑模式状态设置样式
    // Set styles based on dark mode status
    const buttonStyle = {
        display: 'inline-flex' as const,
        alignItems: 'center' as const,
        gap: '8px' as const,
        padding: '8px 12px' as const,
        backgroundColor: isDark ? '#333' : '#f5f5f5',
        borderRadius: '4px' as const,
        textDecoration: 'none' as const,
        color: isDark ? '#f5f5f5' : '#333',
        fontSize: '14px' as const,
        transition: 'background-color 0.3s ease' as const
    };

    // 根据暗黑模式状态设置悬停样式
    // Set hover styles based on dark mode status
    const hoverBackgroundColor = isDark ? '#444' : '#e8e8e8';
    const normalBackgroundColor = isDark ? '#333' : '#f5f5f5';

    return (
        <a
            href={rssPath}
            target="_blank"
            rel="noopener noreferrer"
            style={buttonStyle}
            onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = hoverBackgroundColor;
            }}
            onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = normalBackgroundColor;
            }}
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M6.5 19H21C21.5523 19 22 18.5523 22 18V12C22 11.4477 21.5523 11 21 11H6.5C5.94772 11 5.5 11.4477 5.5 12V18C5.5 18.5523 5.94772 19 6.5 19Z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path
                    d="M6.5 7H21C21.5523 7 22 6.55228 22 6V4C22 3.44772 21.5523 3 21 3H6.5C5.94772 3 5.5 3.44772 5.5 4V6C5.5 6.55228 5.94772 7 6.5 7Z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 16C2 16.5523 2.44772 17 3 17H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round" />
                <path d="M2 8C2 8.55228 2.44772 9 3 9H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round" />
            </svg>
            订阅RSS
        </a>
    );
};
