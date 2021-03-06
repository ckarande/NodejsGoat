"use strict";

var exec = require("child_process").exec;
var sys = require("sys");

var JS_FILES = ["Gruntfile.js", "app/assets/js/**", "config/config.js", "app/data/**/*.js",
    "app/routes/**/*.js", "server.js", "test/**/*.js"
];


module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        watch: {
            js: {
                files: JS_FILES,
                tasks: ["jshint"],
                options: {
                    livereload: true
                }
            },
            html: {
                files: ["app/views/**"],
                options: {
                    livereload: true
                }
            },
            css: {
                files: ["app/assets/css/**"],
                options: {
                    livereload: true
                }
            }
        },
        jshint: {
            all: JS_FILES,
            options: {
                jshintrc: true
            }
        },
        jsbeautifier: {
            files: JS_FILES.concat(["app/views/**", "app/assets/css/**"]),
            options: {
                html: {
                    braceStyle: "collapse",
                    indentChar: " ",
                    indentScripts: "keep",
                    indentSize: 4,
                    maxPreserveNewlines: 10,
                    preserveNewlines: true,
                    unformatted: ["a", "sub", "sup", "b", "i", "u", "pre"],
                    wrapLineLength: 0
                },
                css: {
                    indentChar: " ",
                    indentSize: 4
                },
                js: {
                    braceStyle: "collapse",
                    breakChainedMethods: false,
                    e4x: false,
                    evalCode: false,
                    indentChar: " ",
                    indentLevel: 0,
                    indentSize: 4,
                    indentWithTabs: false,
                    jslintHappy: false,
                    keepArrayIndentation: false,
                    keepFunctionIndentation: false,
                    maxPreserveNewlines: 10,
                    preserveNewlines: true,
                    spaceBeforeConditional: true,
                    spaceInParen: false,
                    unescapeStrings: false,
                    wrapLineLength: 0
                }
            }
        },
        nodemon: {
            dev: {
                options: {
                    file: "server.js",
                    args: [],
                    ignoredFiles: ["README.md", "node_modules/**"],
                    watchedExtensions: ["js", "html", "css"],
                    watchedFolders: ["app/data", "app/routes", "app/assets", "app/views", "app/views/tutorial"],
                    debug: true,
                    delayTime: 1,
                    env: {
                        PORT: 5000
                    },
                    cwd: __dirname
                }
            }
        },
        concurrent: {
            tasks: ["nodemon", "watch"],
            options: {
                logConcurrentOutput: true
            }
        },
        mochaTest: {
            options: {
                reporter: "spec"
            },
            src: ["test/**/*.js"]
        },
        env: {
            test: {
                NODE_ENV: "test"
            }
        },
        retire: {
            js: [],
            node: ["./"],
            options: {
                verbose: true,
                packageOnly: true,
                jsRepository: "https://raw.github.com/bekk/retire.js/master/repository/jsrepository.json",
                nodeRepository: "https://raw.github.com/bekk/retire.js/master/repository/npmrepository.json",
            }
        }

    });

    // Load NPM tasks
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-nodemon");
    grunt.loadNpmTasks("grunt-concurrent");
    grunt.loadNpmTasks("grunt-env");
    grunt.loadNpmTasks("grunt-jsbeautifier");
    grunt.loadNpmTasks("grunt-retire"); // run as: grunt retire

    // Making grunt default to force in order not to break the project.
    grunt.option("force", true);

    grunt.registerTask("db-reset", "(Re)init the database.", function(arg) {
        var finalEnv = arg || "development";
        var done;

        done = this.async();
        exec(
            "NODE_ENV=" + finalEnv + " node artifacts/db-reset.js",
            function(err, stdout, stderr) {
                if (err) {
                    grunt.log.error("db-reset:");
                    grunt.log.error(err);
                    grunt.log.error(stderr);
                } else {
                    grunt.log.ok(stdout);
                }
                done();
            }
        );
    });

    // Code Validation, beautification task(s).
    grunt.registerTask("precommit", ["jsbeautifier", "jshint"]);

    // Test task.
    grunt.registerTask("test", ["env:test", "mochaTest"]);

    // start server.
    grunt.registerTask("run", ["precommit", "concurrent"]);

    // Default task(s).
    grunt.registerTask("default", ["precommit", "concurrent"]);
};
