var resolve = require('rollup-plugin-node-resolve');
var sizeSnapshot = require("rollup-plugin-size-snapshot").sizeSnapshot;
var json = require("rollup-plugin-json");
var options = {
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

module.exports = args => {
	let format = args.format || 'esm'
	options.output.format = args.format;
	options.output.file = `bbmn.${format}.js`;
	if (format != 'esm') {
		options.output.name = 'bbmn';
	}
	return options;
}
