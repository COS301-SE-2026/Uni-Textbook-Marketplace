import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    images: {

        remotePatterns: [

            {
                protocol: 'https',
                hostname: 'blobpocnexusdev.blob.core.windows.net',
                pathname: '/nexusdevimages/**',
            },
        ],
    },
};

export default nextConfig;