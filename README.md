# RB (Reference Builder)

Create beautiful reference portals using Markdown.

## Documentation

### Configuration file

The configuration file is stored with the name **rb.xml**.

**Example file**

```xml
<?xml version="1.0"?>
<portal>
    <title>My Reference Portal</title>
    <base-path>src</base-path>
    <!-- Optional description -->
    <description>My reference portal.</description>
    <!-- Optional icon -->
    <icon>icon.png</icon>
    <!-- Optional top bar colors -->
    <top-bar-colors top="#999" bottom="#000"/>
    <references>
        <reference>
            <base-path>demo-reference</base-path>
            <title>Demo Reference</title>
            <!-- Optional icon -->
            <icon>icon.png</icon>
            <!-- Optional top bar colors -->
            <top-bar-colors top="#999" bottom="#000"/>
            <home>
                <!-- src/demo-reference/index.md -->
                <path>index.md</path>
            </home>
            <sections>
                <section>
                    <!-- src/demo-reference/foo.md -->
                    <title>Foo</title>
                    <path>foo.md</path>
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