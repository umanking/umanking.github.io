<!-- ---
layout: page
title: Tags
permalink: /tags/
# image: '/images/01.jpg'
---
{% assign tags = site.tags | sort %}
{% for tag in tags  %}
 <span class="site-tag">
    <a href="/tag/{{ tag | first | slugify }}/" style="font-size: {{ tag | last | size  |  times: 4 | plus: 80  }}%">
        {{ tag[0] | replace:'-', ' ' }} 
        ({{ tag | last | size }}),
    </a>
</span>
{% endfor %} -->
