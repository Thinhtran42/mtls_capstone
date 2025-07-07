const config = {
    region: import.meta.env.VITE_AWS_REGION || 'ap-southeast-2',
    credentials: import.meta.env.VITE_AWS_ACCESS_KEY &&
        import.meta.env.VITE_AWS_SECRET_KEY ? {
            accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY,
            secretAccessKey: import.meta.env.VITE_AWS_SECRET_KEY
        } : undefined,
    bucketName: 'mycapstonemtls',
    forcePathStyle: true,
    endpoint: undefined,
    signatureVersion: 'v4'
};

export default config;