# RB (Reference Builder)

Create beautiful reference portals using Markdown.

## Documentation

### Configuration file

The configuration file consists of the filename **rb.xml**.

**Example**

```xml
<?xml version="1.0"?>
<portal>
    <title>My Reference Portal</title>
    <base-path>src</base-path>
    <!-- Optional description -->
    <description>My reference portal.</description>
    <!-- Optional icon -->
    <icon>favicon.png</icon>
    <!-- Optional company logo generally 43x72 pixels (attached to the right below the top bar) -->
    <company-logo>qux.png</company-logo>
    <!-- Optional top bar colors -->
    <top-bar-colors top="#999" bottom="#000"/>

    <references>
        <reference>
            <base-path>demo-reference</base-path>
            <title>Demo Reference</title>
            <!-- Optional description -->
            <description>Demo reference.</description>
            <!-- Optional icon -->
            <icon>favicon.png</icon>
            <!-- Optional top bar colors -->
            <top-bar-colors top="#999" bottom="#000"/>
            <home>
                <!-- src/demo-reference/index.md -->
                <title>Demo</title>
                <path>index.md</path>
            </home>
            <sections>
                <section>
                    <!-- src/demo-reference/foo.md -->
                    <title>Foo</title>
                    <path>foo.md</path>

                    <sections>
                        <section>
                            <!-- src/demo-reference/foo/bar.md -->
                            <title>Bar</title>
                            <path>foo/bar.md</path>
                        </section>
                    </sections>
                </section>
            </sections>
        </reference>
    </references>
</portal>
```

### Media

Media (PNG, BMP, GIF, JPG/JPEG, SVG, MP4) get copied from the `<base-path>` path of the `<portal>` element, where for instance, given `<base-path>src</base-path>`, a file such as `src/demo-reference/img.png` will have the static path equals `/demo-reference/img.png`.

The `favicon.png` file is what is used for the document icon; both the portal and reference can specify one.

## License

Apache 2.0