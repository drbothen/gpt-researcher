// A self-invoking function that initializes the ResearchAgent object
const ResearchAgent = (() => {

    // Starts the research process
    const startResearch = () => {
        // Clear previous outputs and report container
        document.getElementById("output").innerHTML = "";
        document.getElementById("reportContainer").innerHTML = "";

        // Display a message indicating the system is generating research questions
        addAgentResponse({ output: "🤔 Generating research questions for the task..." });

        // Start listening to WebSocket events
        listenToSockEvents();
    };

    // Listen to WebSocket events for real-time communication
    const listenToSockEvents = () => {
        // Build WebSocket URI based on the current location
        const { protocol, host, pathname } = window.location;
        const ws_uri = `${protocol === 'https:' ? 'wss:' : 'ws:'}//${host}${pathname}ws`;

        // Create a new Markdown converter and WebSocket instance
        const converter = new showdown.Converter();
        const socket = new WebSocket(ws_uri);

        // Event handler when receiving messages over WebSocket
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Process different types of data received from the server
            if (data.type === 'logs') {
                // Log messages received from the server
                addAgentResponse(data);
            } else if (data.type === 'report') {
                // Display the generated report in the report container
                writeReport(data, converter);
            } else if (data.type === 'path') {
                // Update the download link with the provided path
                updateDownloadLink(data);
            }
        };

        // Event handler when the WebSocket connection is successfully opened
        socket.onopen = (event) => {
            // Gather task, report type, and agent information from user inputs
            const task = document.querySelector('input[name="task"]').value;
            const report_type = document.querySelector('select[name="report_type"]').value;
            const agent = document.querySelector('input[name="agent"]:checked').value;

            // Prepare request data and send a start command to the server
            const requestData = {
                task: task,
                report_type: report_type,
                agent: agent,
            };

            socket.send(`start ${JSON.stringify(requestData)}`);
        };
    };

    // Display agent responses on the output container
    const addAgentResponse = (data) => {
        const output = document.getElementById("output");
        output.innerHTML += '<div class="agent_response">' + data.output + '</div>';
        output.scrollTop = output.scrollHeight;
        output.style.display = "block";
        updateScroll();
    };

    // Convert and display the generated report using Markdown converter
    const writeReport = (data, converter) => {
        const reportContainer = document.getElementById("reportContainer");
        const markdownOutput = converter.makeHtml(data.output);
        reportContainer.innerHTML += markdownOutput;
        updateScroll();
    };

    // Update the download link with the provided path
    const updateDownloadLink = (data) => {
        const path = data.output;
        const downloadLink = document.getElementById("downloadLink");
        downloadLink.href = path;
    };

    // Scroll to the bottom of the page
    const updateScroll = () => {
        window.scrollTo(0, document.body.scrollHeight);
    };

    // Copy the report text to the clipboard
    const copyToClipboard = () => {
        const textarea = document.createElement('textarea');
        textarea.id = 'temp_element';
        textarea.style.height = 0;
        document.body.appendChild(textarea);
        textarea.value = document.getElementById('reportContainer').innerText;
        const selector = document.querySelector('#temp_element');
        selector.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    };

    // Expose public methods and properties
    return {
        startResearch,
        copyToClipboard,
    };
})();