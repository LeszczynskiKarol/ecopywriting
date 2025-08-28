// src/components/HeapAnalytics.tsx
'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { useConsent } from '../context/ConsentContext';

const HeapAnalytics = () => {
    const { heapConsent } = useConsent();
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!isInitialized.current && heapConsent && window.heap) {
            try {
                window.heap.load("3811524779", {
                    disableTextCapture: true,
                    secureCookie: true,
                    autoInit: false // Ważne: wyłączamy auto-init
                });
                isInitialized.current = true;
            } catch (error) {
                console.error('Error initializing Heap:', error);
            }
        }

        // Cleanup
        return () => {
            if (window.heap && !heapConsent) {
                try {
                    window.heap.resetIdentity();
                    isInitialized.current = false;
                } catch (error) {
                    console.error('Error resetting Heap:', error);
                }
            }
        };
    }, [heapConsent]);

    if (!heapConsent) {
        return null;
    }

    return (
        <Script
            id="heap-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
                __html: `
                    window.heapReadyCb=window.heapReadyCb||[],window.heap=window.heap||[],heap.load=function(e,t){window.heap.envId=e,window.heap.clientConfig=t=t||{},window.heap.clientConfig.shouldFetchServerConfig=!1;var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src="https://cdn.us.heap-api.com/config/"+e+"/heap_config.js";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(a,r);var n=["init","startTracking","stopTracking","track","resetIdentity","identify","getSessionId","getUserId","getIdentity","addUserProperties","addEventProperties","removeEventProperty","clearEventProperties","addAccountProperties","addAdapter","addTransformer","addTransformerFn","onReady","addPageviewProperties","removePageviewProperty","clearPageviewProperties","trackPageview"],i=function(e){return function(){var t=Array.prototype.slice.call(arguments,0);window.heapReadyCb.push({name:e,fn:function(){heap[e]&&heap[e].apply(heap,t)}})}};for(var p=0;p<n.length;p++)heap[n[p]]=i(n[p])};
                `
            }}
            onLoad={() => {
                if (heapConsent && !isInitialized.current) {
                    window.heap?.load("3811524779", {
                        disableTextCapture: true,
                        secureCookie: true
                    });
                }
            }}
            onError={(e) => {
                console.error('Error loading Heap script:', e);
                isInitialized.current = false;
            }}
        />
    );
};

export default HeapAnalytics; 