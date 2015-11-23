from flask_assets import Bundle

vis_js = Bundle(
    'vendor/crossfilter.js',
    'vendor/d3.js',
    'vendor/dc.min.js',
    'vendor/jquery-2.1.4.min.js',
    'js/main.js',
    output='public/js/vis.js'
)
