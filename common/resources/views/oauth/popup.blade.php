<h1 style="text-align: center">Logging in</h1>

<script>
    let status = "{!! $status !!}";
    let data   = null;

    @if(isset($data) && $data)
        @if(json_decode($data))
            data = {!! $data !!};
        @else
            data = '{!! $data !!}';
        @endif
    @endif

    var messageObject = {status: status, callbackData: data, type: 'social-auth'};

    if (window.opener && !window.opener.closed) {
        window.opener.postMessage(messageObject, '*');
    }
    else {
        // add a fallback timeout to redirect to the home page
        setTimeout(function() {
            window.location.href = '/';
        }, 5000);

        localStorage.setItem('oauthMessage', JSON.stringify(messageObject));
    }

    window.close();
</script>
