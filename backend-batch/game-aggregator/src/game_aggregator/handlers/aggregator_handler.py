from game_aggregator.aggregator import aggregate

def handler(event, context):
    aggregate()

if __name__ == "__main__":
    handler(None, None)
