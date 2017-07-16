## Classes

<dl>
<dt><a href="#Mailer">Mailer</a></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#transportMap">transportMap</a></dt>
<dd><p>map of labels of node mailer transports</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#getEmailTemplateHTMLString">getEmailTemplateHTMLString(options)</a> ⇒ <code>promise</code></dt>
<dd><p>reads a filepath and returns the email template string (will use EJS to render later by default)</p>
</dd>
<dt><a href="#getTransport">getTransport([options])</a> ⇒ <code>promise</code></dt>
<dd><p>returns a node mailer transport based off of a json configuration</p>
</dd>
</dl>

<a name="Mailer"></a>

## Mailer
**Kind**: global class  

* [Mailer](#Mailer)
    * [new Mailer()](#new_Mailer_new)
    * [.Mailer](#Mailer.Mailer)
        * [new Mailer([options])](#new_Mailer.Mailer_new)
    * [.getEmailTemplateHTMLString()](#Mailer.getEmailTemplateHTMLString)
    * [.getTransport()](#Mailer.getTransport)
    * [.sendEmail([options])](#Mailer.sendEmail) ⇒ <code>promise</code>
    * [.sendEmail([options])](#Mailer.sendEmail) ⇒ <code>promise</code>

<a name="new_Mailer_new"></a>

### new Mailer()
a mailer class for periodic that sends mail using nodemailer

<a name="Mailer.Mailer"></a>

### Mailer.Mailer
**Kind**: static class of <code>[Mailer](#Mailer)</code>  
<a name="new_Mailer.Mailer_new"></a>

#### new Mailer([options])
Creates an instance of Mailer.


| Param | Type | Default |
| --- | --- | --- |
| [options] | <code>any</code> | <code>{}</code> | 

<a name="Mailer.getEmailTemplateHTMLString"></a>

### Mailer.getEmailTemplateHTMLString()
reads a filepath and returns the email template string (will use EJS to render later by default)

**Kind**: static method of <code>[Mailer](#Mailer)</code>  
<a name="Mailer.getTransport"></a>

### Mailer.getTransport()
returns a node mailer transport based off of a json configuration

**Kind**: static method of <code>[Mailer](#Mailer)</code>  
<a name="Mailer.sendEmail"></a>

### Mailer.sendEmail([options]) ⇒ <code>promise</code>
sends email with nodemailer

**Kind**: static method of <code>[Mailer](#Mailer)</code>  
**Returns**: <code>promise</code> - resolves the status of an email  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>any</code> | <code>{}</code> | all of the options to a node mailer transport sendMail function |
| options.to | <code>object</code> &#124; <code>string</code> |  |  |
| options.cc | <code>object</code> &#124; <code>string</code> |  |  |
| options.bcc | <code>object</code> &#124; <code>string</code> |  |  |
| options.replyto | <code>object</code> &#124; <code>string</code> |  |  |
| options.subject | <code>object</code> &#124; <code>string</code> |  |  |
| options.html | <code>object</code> &#124; <code>string</code> |  |  |
| options.text | <code>object</code> &#124; <code>string</code> |  |  |
| options.generateTextFromHTML | <code>object</code> &#124; <code>string</code> |  |  |
| options.emailtemplatestring | <code>object</code> &#124; <code>string</code> |  |  |
| options.emailtemplatedata | <code>object</code> &#124; <code>string</code> |  |  |

<a name="Mailer.sendEmail"></a>

### Mailer.sendEmail([options]) ⇒ <code>promise</code>
sends email with nodemailer

**Kind**: static method of <code>[Mailer](#Mailer)</code>  
**Returns**: <code>promise</code> - resolves the status of an email  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>any</code> | <code>{}</code> | all of the options to a node mailer transport sendMail function |
| options.to | <code>object</code> &#124; <code>string</code> |  |  |
| options.cc | <code>object</code> &#124; <code>string</code> |  |  |
| options.bcc | <code>object</code> &#124; <code>string</code> |  |  |
| options.replyto | <code>object</code> &#124; <code>string</code> |  |  |
| options.subject | <code>object</code> &#124; <code>string</code> |  |  |
| options.html | <code>object</code> &#124; <code>string</code> |  |  |
| options.text | <code>object</code> &#124; <code>string</code> |  |  |
| options.generateTextFromHTML | <code>object</code> &#124; <code>string</code> |  |  |
| options.emailtemplatestring | <code>object</code> &#124; <code>string</code> |  |  |
| options.emailtemplatedata | <code>object</code> &#124; <code>string</code> |  |  |

<a name="transportMap"></a>

## transportMap
map of labels of node mailer transports

**Kind**: global constant  
<a name="getEmailTemplateHTMLString"></a>

## getEmailTemplateHTMLString(options) ⇒ <code>promise</code>
reads a filepath and returns the email template string (will use EJS to render later by default)

**Kind**: global function  
**Returns**: <code>promise</code> - resolves the contents of the passed filepath with the contents of the file as a utf8 string  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | options object, requires an emailtemplatefilepath property |
| options.emailtemplatefilepath | <code>string</code> | file path to email template |

<a name="getTransport"></a>

## getTransport([options]) ⇒ <code>promise</code>
returns a node mailer transport based off of a json configuration

**Kind**: global function  
**Returns**: <code>promise</code> - resolves a node mailer transport  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>any</code> | <code>{}</code> |  |
| options.transportObject | <code>object</code> |  | the json configuration for a node mailer transport |
| options.transportObject.transportType | <code>string</code> |  | [ses|direct|sendmail|smtp-pool|sendgrid|mailgun|stub] |
| options.transportObject.transportOptions | <code>object</code> |  | options for a node mailer transport |

