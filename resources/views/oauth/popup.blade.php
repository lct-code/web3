<h1 style="text-align: center">Logging in</h1>

<script>
    var status = "{!! $status !!}";
    var data   = null;

    @if(isset($data) && $data)
        @if(json_decode($data))
            data = {!! $data !!};
        @else
            data = '{!! $data !!}';
        @endif
    @endif

    var messageObject = {status: status, callbackData: data};

    if (window.opener) {
        window.opener.postMessage(messageObject, '*');
    }
    else {
        localStorage.setItem('oauthMessage', JSON.stringify(MessageObject));
    }
    window.close();
</script>
