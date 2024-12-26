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
    <icon>icon.png</icon>
    <!-- Optional company logo (attached to the right below the top bar) -->
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
            <icon>icon.png</icon>
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

Media (PNG, BMP, JPG/JPEG, SVG, MP4) get copied from the `<base-path>` path of the `<portal>` element, where for instance, given `<base-path>src</base-path>`, a file such as `src/demo-reference/img.png` will have the static path equals `/demo-reference/img.png`.

## License

Apache 2.0