Surf the web at scale with the power of AI.

Nazare is like AutoGPT for the browser. You can give it a task (like "figure out what jobs this company has open") and it will click links and read pages until it accomplishes that task.

# Future
* Fanning out, running instructions against many similar pages in parallel
* list extraction
* tab multi-select
* storing logs and results of threads
* ability to diagnose threads that failed, and iterate on prompts
* Parser generation
* Page compression
* Putting links in context


# Failure modes:
* links that aren't a tags: https://citizen.com/careers
* filtered out anchor links get hallucinated: https://www.twochairs.com/careers-all
