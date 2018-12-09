var resolve = require('rollup-plugin-node-resolve');
var sizeSnapshot = require("rollup-plugin-size-snapshot").sizeSnapshot;
var json = require("rollup-plugin-json");
module.exports = {
	input: 'source.js',
	external: ['jquery','underscore', 'backbone', 'backbone.marionette'],
	output: {
		file: 'bbmn.esm.js',
		format: 'esm',
		exports: 'named',
		sourcemap: true,
		globals: {
			jquery: '$',
			underscore: '_'
		}
	},
	plugins:[
		json(),
		resolve(),
		sizeSnapshot()
	]
};
