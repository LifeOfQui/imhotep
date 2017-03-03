module.exports = {
    entry: {
        App: './app/assets/scripts/App.js'
    },
    output: {
        path: './app/temp/scripts',
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                loader: 'babel-loader',
                test: /\.js$/,
                exclude: /node_modules/
            }
        ]
    }
};
