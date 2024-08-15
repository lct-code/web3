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

    // add a fallback timeout to redirect to the home page
    setTimeout(function() {
        window.location.href = '/';
    }, 5000);

    if (window.opener) {
        window.opener.postMessage(messageObject, '*');
    }
    else {
        localStorage.setItem('oauthMessage', JSON.stringify(messageObject));
    }

    try {
      window.close();
    }
    catch (e) {
      // print error, wait for the timeout if the window couldn't be closed
      console.log('Error closing the window: ', e);
    }
</script>
