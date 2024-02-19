const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

function loadRoutes(directory) {
    fs.readdirSync(directory).forEach(file => {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            loadRoutes(fullPath); // Recursively load routes from subdirectories
        } else if (file !== 'index.js' && file.endsWith('.js')) {
            const { router: route, routePath } = require(fullPath);
            const finalRoutePath = routePath === '/api' ? '/' : routePath;

            console.log(finalRoutePath)

            router.use(finalRoutePath, route); // Mount the route at the specified path
            console.log(`Added route: ${finalRoutePath}`);
        }
    });
}

loadRoutes(__dirname);

module.exports = router;
